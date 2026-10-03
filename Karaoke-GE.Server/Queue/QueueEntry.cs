namespace Karaoke_GE.Server.Queue;

public sealed record QueueEntry(
    Guid Id,
    Guid SingerId,
    string SingerName,
    bool IsLeader,
    string VideoId,
    string Title);
