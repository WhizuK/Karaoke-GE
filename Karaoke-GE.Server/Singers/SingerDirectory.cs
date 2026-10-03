namespace Karaoke_GE.Server.Singers;

/// <summary>
/// Quem está ligado e quem é líder.
/// O estado de líder fica associado ao ID da pessoa (e não à ligação),
/// por isso mantém-se se o telemóvel perder o Wi-Fi e voltar a ligar.
/// </summary>
public sealed class SingerDirectory
{
    private readonly Lock _lock = new();
    private readonly Dictionary<string, Guid> _singerIdByConnection = [];
    private readonly Dictionary<Guid, Singer> _singersById = [];
    private readonly HashSet<Guid> _leaderIds = [];

    public IReadOnlyList<Singer> ConnectedSingers
    {
        get
        {
            lock (_lock)
            {
                return _singerIdByConnection.Values
                    .Distinct()
                    .Select(singerId => _singersById[singerId])
                    .OrderBy(singer => singer.Name, StringComparer.CurrentCultureIgnoreCase)
                    .ToArray();
            }
        }
    }

    public Singer Register(string connectionId, Guid singerId, string name)
    {
        lock (_lock)
        {
            var singer = new Singer(singerId, name, IsLeader: _leaderIds.Contains(singerId));
            _singersById[singerId] = singer;
            _singerIdByConnection[connectionId] = singerId;
            return singer;
        }
    }

    public Singer? FindByConnection(string connectionId)
    {
        lock (_lock)
        {
            return _singerIdByConnection.TryGetValue(connectionId, out var singerId)
                ? _singersById[singerId]
                : null;
        }
    }

    public void Disconnect(string connectionId)
    {
        lock (_lock)
        {
            _singerIdByConnection.Remove(connectionId);
        }
    }

    public void SetLeader(Guid singerId, bool isLeader)
    {
        lock (_lock)
        {
            var singer = _singersById.GetValueOrDefault(singerId)
                ?? throw new RuleViolationException("Essa pessoa não está registada.");

            if (isLeader)
            {
                _leaderIds.Add(singerId);
            }
            else
            {
                _leaderIds.Remove(singerId);
            }

            _singersById[singerId] = singer with { IsLeader = isLeader };
        }
    }
}
