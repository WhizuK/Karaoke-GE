using Microsoft.AspNetCore.SignalR;

namespace Karaoke_GE.Server.Hubs
{
    public sealed class KaraokeHub(ConnectionCounter connetionCounter) : Hub<IKaraokeClient>
    {
        public override async Task OnConnectedAsync()
        {
            var total = connetionCounter.increment();
            await Clients.All.ConnectedDevicesChanged(total);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var total = connetionCounter.decrement();
            await Clients.All.ConnectedDevicesChanged(total);
            await base.OnDisconnectedAsync(exception);
        }
    }
}
