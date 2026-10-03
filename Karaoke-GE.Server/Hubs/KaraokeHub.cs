using Karaoke_GE.Server.Playback;
using Microsoft.AspNetCore.SignalR;

namespace Karaoke_GE.Server.Hubs;

public sealed class KaraokeHub(ConnectionCounter connectionCounter, PlaybackStore playbackStore)
    : Hub<IKaraokeClient>
{
    public override async Task OnConnectedAsync()
    {
        var total = connectionCounter.Increment();
        await Clients.All.ConnectedDevicesChanged(total);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var total = connectionCounter.Decrement();
        await Clients.All.ConnectedDevicesChanged(total);
        await base.OnDisconnectedAsync(exception);
    }

    public PlaybackState GetPlaybackState() => playbackStore.Current;

    public Task LoadVideo(string videoId)
    {
        if (!YouTubeVideoId.IsValid(videoId))
        {
            throw new HubException("Link do YouTube inválido.");
        }

        return ChangePlayback(_ => new PlaybackState(videoId, IsPlaying: true, PositionSeconds: 0));
    }

    public Task Play() => ChangePlayback(state => state with { IsPlaying = true });

    public Task Pause() => ChangePlayback(state => state with { IsPlaying = false });

    public Task Stop() => ChangePlayback(_ => PlaybackState.Empty);

    public Task SeekTo(double positionSeconds)
    {
        EnsureValidPosition(positionSeconds);
        return ChangePlayback(state => state with { PositionSeconds = positionSeconds });
    }

    public Task ReportPosition(double positionSeconds)
    {
        EnsureValidPosition(positionSeconds);
        playbackStore.Update(state => state with { PositionSeconds = positionSeconds });
        return Clients.Others.PositionReported(positionSeconds);
    }

    private Task ChangePlayback(Func<PlaybackState, PlaybackState> change)
    {
        var newState = playbackStore.Update(change);
        return Clients.All.PlaybackChanged(newState);
    }

    private static void EnsureValidPosition(double positionSeconds)
    {
        if (!double.IsFinite(positionSeconds) || positionSeconds < 0)
        {
            throw new HubException("Posição do vídeo inválida.");
        }
    }
}
