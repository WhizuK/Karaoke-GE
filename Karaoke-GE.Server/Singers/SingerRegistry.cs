using System.Collections.Concurrent;

namespace Karaoke_GE.Server.Singers;

public sealed class SingerRegistry
{
    private readonly ConcurrentDictionary<string, Singer> _singersByConnection = new();

    public void Register(string connectionId, Singer singer) =>
        _singersByConnection[connectionId] = singer;

    public Singer? Find(string connectionId) =>
        _singersByConnection.TryGetValue(connectionId, out var singer) ? singer : null;

    public void Remove(string connectionId) =>
        _singersByConnection.TryRemove(connectionId, out _);
}
