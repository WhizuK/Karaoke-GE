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

    public QueueSnapshot Add(Singer singer, string videoId, string title)
    {
        lock (_lock)
        {
            if (!singer.IsLeader && _upcoming.Any(entry => entry.SingerId == singer.Id))
            {
                throw new RuleViolationException("Já tens uma música na fila. Espera pela tua vez.");
            }

            var entry = new QueueEntry(Guid.NewGuid(), singer.Id, singer.Name, singer.IsLeader, videoId, title);
            _upcoming.Insert(FindInsertIndex(singer), entry);
            return CreateSnapshot();
        }
    }

    public QueueSnapshot Remove(Guid entryId, Requester requester)
    {
        lock (_lock)
        {
            var entry = FindChangeableEntry(entryId, requester);
            _upcoming.Remove(entry);
            return CreateSnapshot();
        }
    }

    public QueueSnapshot MoveUp(Guid entryId, Requester requester) => Move(entryId, requester, offset: -1);

    public QueueSnapshot MoveDown(Guid entryId, Requester requester) => Move(entryId, requester, offset: 1);

    public QueueSnapshot StartNext(Requester requester)
    {
        lock (_lock)
        {
            if (_current is not null)
            {
                throw new RuleViolationException("Ainda há uma música a tocar.");
            }

            var next = _upcoming.FirstOrDefault()
                ?? throw new RuleViolationException("A fila está vazia.");

            if (!requester.CanChange(next))
            {
                throw new RuleViolationException("Ainda não é a tua vez.");
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
        if (!singer.IsLeader)
        {
            return _upcoming.Count;
        }

        var lastOwnIndex = _upcoming.FindLastIndex(entry => entry.SingerId == singer.Id);
        if (lastOwnIndex >= 0)
        {
            return lastOwnIndex + 1;
        }

        return _upcoming.FindLastIndex(entry => entry.IsLeader) + 1;
    }

    private QueueSnapshot Move(Guid entryId, Requester requester, int offset)
    {
        lock (_lock)
        {
            var entry = FindChangeableEntry(entryId, requester);
            var index = _upcoming.IndexOf(entry);
            var targetIndex = index + offset;

            if (targetIndex < 0 || targetIndex >= _upcoming.Count)
            {
                throw new RuleViolationException("Essa música não pode ir mais para esse lado.");
            }

            var staysInOwnBlock = _upcoming[targetIndex].SingerId == entry.SingerId;
            if (!requester.IsAdmin && !staysInOwnBlock)
            {
                throw new RuleViolationException("Só podes trocar a ordem dentro das tuas músicas.");
            }

            (_upcoming[index], _upcoming[targetIndex]) = (_upcoming[targetIndex], _upcoming[index]);
            return CreateSnapshot();
        }
    }

    private QueueEntry FindChangeableEntry(Guid entryId, Requester requester)
    {
        var entry = _upcoming.Find(candidate => candidate.Id == entryId)
            ?? throw new RuleViolationException("Essa música já não está na fila.");

        if (!requester.CanChange(entry))
        {
            throw new RuleViolationException("Só podes alterar as tuas músicas.");
        }

        return entry;
    }

    private QueueSnapshot CreateSnapshot() => new(_current, _upcoming.ToArray());
}
