using Karaoke_GE.Server.Storage;

namespace Karaoke_GE.Server.Library;

/// <summary>"Músicas da igreja": todas as músicas que já foram cantadas, guardadas em ficheiro.</summary>
public sealed class SongLibrary
{
    private const string FileName = "library.json";

    private readonly Lock _lock = new();
    private readonly DataFiles _dataFiles;
    private readonly Dictionary<string, LibrarySong> _songsByVideoId;

    public SongLibrary(DataFiles dataFiles)
    {
        _dataFiles = dataFiles;
        _songsByVideoId = dataFiles
            .Read(FileName, Array.Empty<LibrarySong>())
            .DistinctBy(song => song.VideoId)
            .ToDictionary(song => song.VideoId);
    }

    public IReadOnlyList<LibrarySong> Songs
    {
        get
        {
            lock (_lock)
            {
                return SortedSongs();
            }
        }
    }

    public IReadOnlyList<LibrarySong> RecordSung(string videoId, string title)
    {
        lock (_lock)
        {
            var timesSung = _songsByVideoId.TryGetValue(videoId, out var existing) ? existing.TimesSung : 0;
            _songsByVideoId[videoId] = new LibrarySong(videoId, title, timesSung + 1, DateTimeOffset.Now);
            return SaveAndSort();
        }
    }

    public IReadOnlyList<LibrarySong> Remove(string videoId)
    {
        lock (_lock)
        {
            _songsByVideoId.Remove(videoId);
            return SaveAndSort();
        }
    }

    private IReadOnlyList<LibrarySong> SaveAndSort()
    {
        var songs = SortedSongs();
        _dataFiles.Write(FileName, songs);
        return songs;
    }

    // As mais cantadas primeiro; em caso de empate, as mais recentes.
    private LibrarySong[] SortedSongs() =>
        _songsByVideoId.Values
            .OrderByDescending(song => song.TimesSung)
            .ThenByDescending(song => song.LastSungAt)
            .ToArray();
}
