using Microsoft.AspNetCore.SignalR;

namespace Karaoke_GE.Server.Hubs;

public sealed class RuleViolationHubFilter : IHubFilter
{
    public async ValueTask<object?> InvokeMethodAsync(
        HubInvocationContext invocationContext,
        Func<HubInvocationContext, ValueTask<object?>> next)
    {
        try
        {
            return await next(invocationContext);
        }
        catch (RuleViolationException exception)
        {
            throw new HubException(exception.Message);
        }
    }
}
