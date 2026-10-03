namespace Karaoke_GE.Server.Playback;

public sealed record PlaybackState(string? VideoId, bool IsPlaying, double PositionSeconds, int Volume)
{
    public const int MaxVolume = 100;

    public static PlaybackState Empty { get; } =
        new(VideoId: null, IsPlaying: false, PositionSeconds: 0, Volume: MaxVolume);

    public PlaybackState WithVideo(string videoId) =>
        this with { VideoId = videoId, IsPlaying = true, PositionSeconds = 0 };

    public PlaybackState WithoutVideo() =>
        this with { VideoId = null, IsPlaying = false, PositionSeconds = 0 };
}
