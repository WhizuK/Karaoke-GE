using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;

namespace Karaoke_GE.Server.Admin;

/// <summary>Que ligações entraram como admin (com o PIN certo).</summary>
public sealed class AdminSessions(IOptions<AdminOptions> options)
{
    private readonly ConcurrentDictionary<string, bool> _adminConnections = new();

    public bool TryLogin(string connectionId, string pin)
    {
        if (!PinMatches(pin))
        {
            return false;
        }

        _adminConnections[connectionId] = true;
        return true;
    }

    public bool IsAdmin(string connectionId) => _adminConnections.ContainsKey(connectionId);

    public void Disconnect(string connectionId) => _adminConnections.TryRemove(connectionId, out _);

    // Compara sempre todos os bytes, para não revelar pelo tempo de resposta
    // quantos dígitos do PIN estão certos.
    private bool PinMatches(string pin) =>
        CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(pin),
            Encoding.UTF8.GetBytes(options.Value.Pin));
}
