using System.Net.NetworkInformation;
using System.Net.Sockets;

namespace Karaoke_GE.Server.Network;

public sealed class LocalNetworkAddressProvider
{
    public string? GetLocalIPv4Address() =>
        NetworkInterface.GetAllNetworkInterfaces()
            .Where(IsConnectedToLocalNetwork)
            .SelectMany(networkInterface => networkInterface.GetIPProperties().UnicastAddresses)
            .Select(unicastAddress => unicastAddress.Address)
            .Where(address => address.AddressFamily == AddressFamily.InterNetwork)
            .Select(address => address.ToString())
            .FirstOrDefault();

    private static bool IsConnectedToLocalNetwork(NetworkInterface networkInterface) =>
        networkInterface.OperationalStatus == OperationalStatus.Up
        && networkInterface.NetworkInterfaceType != NetworkInterfaceType.Loopback
        && networkInterface.GetIPProperties().GatewayAddresses.Count > 0;
}
