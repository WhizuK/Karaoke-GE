using Karaoke_GE.Server.Singers;

namespace Karaoke_GE.Server.Queue;

public sealed class SongQueue
{
    private readonly Lock _lock = new();
    private readonly List<QueueEntry> _upcoming = [];
    private QueueEntry? _current;

    public QueueSnapshot Snapshot
    {
        get
        {
            lock (_lock)
            {
                return CreateSnapshot();
            }
        }
    }

    public QueueSnapshot Add(Singer singer, string videoId)
    {
        lock (_lock)
        {
            if (!singer.IsMinister && _upcoming.Any(entry => entry.SingerId == singer.Id))
            {
                throw new QueueRuleException("Já tens uma música na fila. Espera pela tua vez.");
            }

            var entry = new QueueEntry(Guid.NewGuid(), singer.Id, singer.Name, singer.IsMinister, videoId);
            _upcoming.Insert(FindInsertIndex(singer), entry);
            return CreateSnapshot();
        }
    }

    public QueueSnapshot Remove(Guid entryId, Guid requesterId)
    {
        lock (_lock)
        {
            var entry = FindOwnedEntry(entryId, requesterId);
            _upcoming.Remove(entry);
            return CreateSnapshot();
        }
    }

    public QueueSnapshot MoveUp(Guid entryId, Guid requesterId) => Move(entryId, requesterId, offset: -1);

    public QueueSnapshot MoveDown(Guid entryId, Guid requesterId) => Move(entryId, requesterId, offset: 1);

    public QueueSnapshot StartNext(Guid requesterId)
    {
        lock (_lock)
        {
            if (_current is not null)
            {
                throw new QueueRuleException("Ainda há uma música a tocar.");
            }

            var next = _upcoming.FirstOrDefault()
                ?? throw new QueueRuleException("A fila está vazia.");

            if (next.SingerId != requesterId)
            {
                throw new QueueRuleException("Ainda não é a tua vez.");
            }

            _upcoming.RemoveAt(0);
            _current = next;
            return CreateSnapshot();
        }
    }

    public QueueSnapshot FinishCurrent()
    {
        lock (_lock)
        {
            _current = null;
            return CreateSnapshot();
        }
    }

    private int FindInsertIndex(Singer singer)
    {
        if (!singer.IsMinister)
        {
            return _upcoming.Count;
        }

        var lastOwnIndex = _upcoming.FindLastIndex(entry => entry.SingerId == singer.Id);
        if (lastOwnIndex >= 0)
        {
            return lastOwnIndex + 1;
        }

        return _upcoming.FindLastIndex(entry => entry.IsMinister) + 1;
    }

    private QueueSnapshot Move(Guid entryId, Guid requesterId, int offset)
    {
        lock (_lock)
        {
            var entry = FindOwnedEntry(entryId, requesterId);
            var index = _upcoming.IndexOf(entry);
            var targetIndex = index + offset;

            var staysInOwnBlock = targetIndex >= 0
                && targetIndex < _upcoming.Count
                && _upcoming[targetIndex].SingerId == requesterId;

            if (!staysInOwnBlock)
            {
                throw new QueueRuleException("Só podes trocar a ordem dentro das tuas músicas.");
            }

            (_upcoming[index], _upcoming[targetIndex]) = (_upcoming[targetIndex], _upcoming[index]);
            return CreateSnapshot();
        }
    }

    private QueueEntry FindOwnedEntry(Guid entryId, Guid requesterId)
    {
        var entry = _upcoming.Find(candidate => candidate.Id == entryId)
            ?? throw new QueueRuleException("Essa música já não está na fila.");

        if (entry.SingerId != requesterId)
        {
            throw new QueueRuleException("Só podes alterar as tuas músicas.");
        }

        return entry;
    }

    private QueueSnapshot CreateSnapshot() => new(_current, _upcoming.ToArray());
}
