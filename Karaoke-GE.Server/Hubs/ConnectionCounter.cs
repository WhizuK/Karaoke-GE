namespace Karaoke_GE.Server.Hubs
{
    public sealed class ConnectionCounter
    {
        private int _count;

        public int increment() => Interlocked.Increment(ref _count);
        public int decrement() => Interlocked.Decrement(ref _count);

    }
}
