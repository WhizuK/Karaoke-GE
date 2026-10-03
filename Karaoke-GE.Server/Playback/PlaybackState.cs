namespace Karaoke_GE.Server.Playback;

public sealed record PlaybackState(string? VideoId, bool IsPlaying, double PositionSeconds)
{
    public static PlaybackState Empty { get; } = new(VideoId: null, IsPlaying: false, PositionSeconds: 0);
}
