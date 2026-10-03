namespace Karaoke_GE.Server.Playback;

public sealed class PlaybackStore
{
    private readonly Lock _lock = new();
    private PlaybackState _current = PlaybackState.Empty;

    public PlaybackState Current
    {
        get
        {
            lock (_lock)
            {
                return _current;
            }
        }
    }

    public PlaybackState Update(Func<PlaybackState, PlaybackState> change)
    {
        lock (_lock)
        {
            _current = change(_current);
            return _current;
        }
    }
}
