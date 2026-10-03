namespace Karaoke_GE.Server.Hubs
{
    public interface IKaraokeClient
    {
        Task ConnectedDevicesChanged(int total);
    }
}
