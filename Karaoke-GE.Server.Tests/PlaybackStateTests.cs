using Karaoke_GE.Server.Playback;

namespace Karaoke_GE.Server.Tests;

public class PlaybackStateTests
{
    private static readonly PlaybackState PausedAt73Seconds =
        PlaybackState.Empty.WithVideo("dQw4w9WgXcQ") with { IsPlaying = false, PositionSeconds = 73 };

    [Fact]
    public void Moving_back_keeps_the_song_paused_at_the_new_position()
    {
        var moved = PausedAt73Seconds.WithPositionMovedBy(-10);

        Assert.Equal(63.0, moved.PositionSeconds);
        Assert.False(moved.IsPlaying);
        Assert.Equal("dQw4w9WgXcQ", moved.VideoId);
    }

    [Fact]
    public void Moving_forward_adds_to_the_current_position()
    {
        Assert.Equal(83.0, PausedAt73Seconds.WithPositionMovedBy(10).PositionSeconds);
    }

    [Fact]
    public void Moving_back_never_goes_before_the_start()
    {
        var nearStart = PausedAt73Seconds with { PositionSeconds = 4 };

        Assert.Equal(0.0, nearStart.WithPositionMovedBy(-10).PositionSeconds);
    }

    [Fact]
    public void Playing_after_moving_keeps_the_new_position()
    {
        var resumed = PausedAt73Seconds.WithPositionMovedBy(-10) with { IsPlaying = true };

        Assert.Equal(63.0, resumed.PositionSeconds);
    }
}
