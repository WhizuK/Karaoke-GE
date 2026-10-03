namespace Karaoke_GE.Server.Queue;

/// <summary>Quem está a pedir uma alteração à fila: um cantor ou o admin.</summary>
public readonly record struct Requester(Guid? SingerId, bool IsAdmin)
{
    public static Requester Admin { get; } = new(SingerId: null, IsAdmin: true);

    public static Requester ForSinger(Guid singerId) => new(singerId, IsAdmin: false);

    public bool CanChange(QueueEntry entry) => IsAdmin || entry.SingerId == SingerId;
}
