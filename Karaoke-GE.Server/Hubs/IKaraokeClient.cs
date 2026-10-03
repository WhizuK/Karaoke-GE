using Karaoke_GE.Server.Playback;

namespace Karaoke_GE.Server.Hubs;

public interface IKaraokeClient
{
    Task ConnectedDevicesChanged(int total);

    Task PlaybackChanged(PlaybackState state);

    Task PositionReported(double positionSeconds);
}
