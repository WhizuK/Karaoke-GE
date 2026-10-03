using Karaoke_GE.Server.Library;
using Karaoke_GE.Server.Playback;
using Karaoke_GE.Server.Queue;
using Karaoke_GE.Server.Singers;

namespace Karaoke_GE.Server.Hubs;

public interface IKaraokeClient
{
    Task ConnectedDevicesChanged(int total);

    Task PlaybackChanged(PlaybackState state);

    Task PositionReported(double positionSeconds);

    Task QueueChanged(QueueSnapshot queue);

    Task SingersChanged(IReadOnlyList<Singer> singers);

    Task LibraryChanged(IReadOnlyList<LibrarySong> songs);
}
