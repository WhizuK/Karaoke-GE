using Karaoke_GE.Server.Admin;
using Karaoke_GE.Server.Library;
using Karaoke_GE.Server.Playback;
using Karaoke_GE.Server.Queue;
using Karaoke_GE.Server.Singers;
using Karaoke_GE.Server.YouTube;
using Microsoft.AspNetCore.SignalR;

namespace Karaoke_GE.Server.Hubs;

public sealed class KaraokeHub(
    ConnectionCounter connectionCounter,
    PlaybackStore playbackStore,
    SongQueue songQueue,
    SingerDirectory singerDirectory,
    AdminSessions adminSessions,
    YouTubeClient youTubeClient,
    QueueStorage queueStorage,
    SongLibrary songLibrary) : Hub<IKaraokeClient>
{
    private const int MinNameLength = 2;
    private const int MaxNameLength = 30;

    public override async Task OnConnectedAsync()
    {
        var total = connectionCounter.Increment();
        await Clients.All.ConnectedDevicesChanged(total);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        singerDirectory.Disconnect(Context.ConnectionId);
        adminSessions.Disconnect(Context.ConnectionId);

        var total = connectionCounter.Decrement();
        await Clients.All.ConnectedDevicesChanged(total);
        await BroadcastSingers();
        await base.OnDisconnectedAsync(exception);
    }

    // ---------- Identificação ----------

    public async Task<Singer> Register(Guid singerId, string name)
    {
        var displayName = name.Trim();
        if (displayName.Length is < MinNameLength or > MaxNameLength)
        {
            throw new RuleViolationException($"O nome deve ter entre {MinNameLength} e {MaxNameLength} letras.");
        }

        var singer = singerDirectory.Register(Context.ConnectionId, singerId, displayName);
        await BroadcastSingers();
        return singer;
    }

    public IReadOnlyList<Singer> GetSingers() => singerDirectory.ConnectedSingers;

    // ---------- Admin ----------

    public void LoginAsAdmin(string pin)
    {
        if (!adminSessions.TryLogin(Context.ConnectionId, pin))
        {
            throw new RuleViolationException("PIN errado.");
        }
    }

    public Task SetLeader(Guid singerId, bool isLeader)
    {
        RequireAdmin();
        singerDirectory.SetLeader(singerId, isLeader);
        return BroadcastSingers();
    }

    public Task SetVolume(int volume)
    {
        RequireAdmin();
        var safeVolume = Math.Clamp(volume, 0, PlaybackState.MaxVolume);
        return ChangePlayback(state => state with { Volume = safeVolume });
    }

    // ---------- Fila ----------

    public QueueSnapshot GetQueue() => songQueue.Snapshot;

    public async Task AddToQueue(string videoId)
    {
        if (!YouTubeVideoId.IsValid(videoId))
        {
            throw new RuleViolationException("Link do YouTube inválido.");
        }

        var singer = RequireSinger();
        var title = await youTubeClient.GetTitleAsync(videoId, Context.ConnectionAborted);
        await BroadcastQueue(songQueue.Add(singer, videoId, title));
    }

    public Task RemoveFromQueue(Guid entryId) =>
        BroadcastQueue(songQueue.Remove(entryId, CurrentRequester()));

    public Task MoveUpInQueue(Guid entryId) =>
        BroadcastQueue(songQueue.MoveUp(entryId, CurrentRequester()));

    public Task MoveDownInQueue(Guid entryId) =>
        BroadcastQueue(songQueue.MoveDown(entryId, CurrentRequester()));

    public async Task StartNextSong()
    {
        var snapshot = songQueue.StartNext(CurrentRequester());
        var current = snapshot.Current
            ?? throw new InvalidOperationException("StartNext devia ter definido a música atual.");

        await BroadcastQueue(snapshot);
        await ChangePlayback(state => state.WithVideo(current.VideoId));
        await Clients.All.LibraryChanged(songLibrary.RecordSung(current.VideoId, current.Title));
    }

    // ---------- Músicas da igreja ----------

    public IReadOnlyList<LibrarySong> GetLibrary() => songLibrary.Songs;

    public Task RemoveFromLibrary(string videoId)
    {
        RequireAdmin();
        return Clients.All.LibraryChanged(songLibrary.Remove(videoId));
    }

    // ---------- Controlo do vídeo (quem está a cantar ou o admin) ----------

    public PlaybackState GetPlaybackState() => playbackStore.Current;

    public Task Play()
    {
        EnsureCanControlPlayback();
        return ChangePlayback(state => state with { IsPlaying = true });
    }

    public Task Pause()
    {
        EnsureCanControlPlayback();
        return ChangePlayback(state => state with { IsPlaying = false });
    }

    public Task SeekTo(double positionSeconds)
    {
        EnsureValidPosition(positionSeconds);
        EnsureCanControlPlayback();
        return ChangePlayback(state => state with { PositionSeconds = positionSeconds });
    }

    // "Recuar/Avançar 10 s" é calculado aqui, a partir da posição que o PC reportou.
    // Não confiamos no relógio do telemóvel ou do admin: pode estar parado ou desatualizado.
    public Task SeekBy(double deltaSeconds)
    {
        if (!double.IsFinite(deltaSeconds))
        {
            throw new RuleViolationException("Salto inválido.");
        }

        EnsureCanControlPlayback();
        return ChangePlayback(state => state.WithPositionMovedBy(deltaSeconds));
    }

    public Task Stop()
    {
        EnsureCanControlPlayback();
        return FinishSong();
    }

    // ---------- Chamados pelo ecrã do PC ----------

    public Task ReportSongEnded() => FinishSong();

    public Task ReportPosition(double positionSeconds)
    {
        EnsureValidPosition(positionSeconds);
        playbackStore.Update(state => state with { PositionSeconds = positionSeconds });
        return Clients.Others.PositionReported(positionSeconds);
    }

    // ---------- Auxiliares ----------

    private bool IsAdmin => adminSessions.IsAdmin(Context.ConnectionId);

    private Singer RequireSinger() =>
        singerDirectory.FindByConnection(Context.ConnectionId)
            ?? throw new RuleViolationException("Primeiro tens de entrar com o teu nome.");

    private void RequireAdmin()
    {
        if (!IsAdmin)
        {
            throw new RuleViolationException("Só o admin pode fazer isto.");
        }
    }

    private Requester CurrentRequester() =>
        IsAdmin ? Requester.Admin : Requester.ForSinger(RequireSinger().Id);

    private void EnsureCanControlPlayback()
    {
        if (IsAdmin)
        {
            return;
        }

        var singer = RequireSinger();
        if (songQueue.Snapshot.Current?.SingerId != singer.Id)
        {
            throw new RuleViolationException("Só quem está a cantar pode controlar a música.");
        }
    }

    private async Task FinishSong()
    {
        await BroadcastQueue(songQueue.FinishCurrent());
        await ChangePlayback(state => state.WithoutVideo());
    }

    private Task BroadcastQueue(QueueSnapshot snapshot)
    {
        queueStorage.Save(snapshot);
        return Clients.All.QueueChanged(snapshot);
    }

    private Task BroadcastSingers() => Clients.All.SingersChanged(singerDirectory.ConnectedSingers);

    private Task ChangePlayback(Func<PlaybackState, PlaybackState> change)
    {
        var newState = playbackStore.Update(change);
        return Clients.All.PlaybackChanged(newState);
    }

    private static void EnsureValidPosition(double positionSeconds)
    {
        if (!double.IsFinite(positionSeconds) || positionSeconds < 0)
        {
            throw new RuleViolationException("Posição do vídeo inválida.");
        }
    }
}
