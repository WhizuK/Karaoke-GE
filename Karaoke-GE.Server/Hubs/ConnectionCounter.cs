namespace Karaoke_GE.Server.Hubs;

public sealed class ConnectionCounter
{
    private int _count;

    public int Increment() => Interlocked.Increment(ref _count);

    public int Decrement() => Interlocked.Decrement(ref _count);
}
