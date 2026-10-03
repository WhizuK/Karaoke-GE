using Karaoke_GE.Server.Storage;

namespace Karaoke_GE.Server.Singers;

/// <summary>
/// Quem está ligado e quem é líder.
/// O estado de líder fica associado ao ID da pessoa (e não à ligação),
/// por isso mantém-se se o telemóvel perder o Wi-Fi e voltar a ligar.
/// </summary>
public sealed class SingerDirectory
{
    private const string LeadersFileName = "leaders.json";

    private readonly Lock _lock = new();
    private readonly DataFiles _dataFiles;
    private readonly Dictionary<string, Guid> _singerIdByConnection = [];
    private readonly Dictionary<Guid, Singer> _singersById = [];
    private readonly HashSet<Guid> _leaderIds;

    public SingerDirectory(DataFiles dataFiles)
    {
        _dataFiles = dataFiles;
        _leaderIds = [.. dataFiles.Read(LeadersFileName, Array.Empty<Guid>())];
    }

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
            _dataFiles.Write(LeadersFileName, _leaderIds.ToArray());
        }
    }
}
