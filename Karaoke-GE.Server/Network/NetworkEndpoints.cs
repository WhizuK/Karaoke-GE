namespace Karaoke_GE.Server.Network;

public static class NetworkEndpoints
{
    public static IEndpointRouteBuilder MapNetworkEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/network/address", GetLocalAddress);
        return app;
    }

    private static IResult GetLocalAddress(LocalNetworkAddressProvider addressProvider)
    {
        var ipAddress = addressProvider.GetLocalIPv4Address();

        return ipAddress is null
            ? Results.Problem("Não foi encontrada nenhuma rede local.", statusCode: 503)
            : Results.Ok(new NetworkAddressResponse(ipAddress));
    }
}

public sealed record NetworkAddressResponse(string IpAddress);
