using Microsoft.AspNetCore.SignalR;

namespace Karaoke_GE.Server.Hubs;

public sealed class KaraokeHub(ConnectionCounter connectionCounter) : Hub<IKaraokeClient>
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
}
