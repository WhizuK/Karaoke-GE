namespace Karaoke_GE.Server.Queue;

public sealed record QueueSnapshot(QueueEntry? Current, IReadOnlyList<QueueEntry> Upcoming);
