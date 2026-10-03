using Karaoke_GE.Server.Queue;
using Karaoke_GE.Server.Singers;

namespace Karaoke_GE.Server.Tests;

public class SongQueueTests
{
    private const string AnyVideoId = "dQw4w9WgXcQ";

    private static readonly Singer Ana = new(Guid.NewGuid(), "Ana", IsMinister: false);
    private static readonly Singer Pedro = new(Guid.NewGuid(), "Pedro", IsMinister: false);
    private static readonly Singer PastorJoao = new(Guid.NewGuid(), "Pr. João", IsMinister: true);
    private static readonly Singer Maria = new(Guid.NewGuid(), "Maria", IsMinister: true);

    [Fact]
    public void Regular_singer_cannot_have_two_songs_waiting()
    {
        var queue = new SongQueue();
        queue.Add(Ana, AnyVideoId);

        Assert.Throws<QueueRuleException>(() => queue.Add(Ana, AnyVideoId));
    }

    [Fact]
    public void Minister_can_add_several_songs()
    {
        var queue = new SongQueue();
        queue.Add(PastorJoao, AnyVideoId);
        queue.Add(PastorJoao, AnyVideoId);
        var snapshot = queue.Add(PastorJoao, AnyVideoId);

        Assert.Equal(3, snapshot.Upcoming.Count);
    }

    [Fact]
    public void Minister_songs_go_before_regular_singers()
    {
        var queue = new SongQueue();
        queue.Add(Ana, AnyVideoId);
        queue.Add(Pedro, AnyVideoId);
        queue.Add(PastorJoao, AnyVideoId);
        var snapshot = queue.Add(PastorJoao, AnyVideoId);

        Assert.Equal(new[] { "Pr. João", "Pr. João", "Ana", "Pedro" }, SingerNames(snapshot));
    }

    [Fact]
    public void Ministers_keep_arrival_order_and_their_blocks_together()
    {
        var queue = new SongQueue();
        queue.Add(PastorJoao, AnyVideoId);
        queue.Add(Maria, AnyVideoId);
        var snapshot = queue.Add(PastorJoao, AnyVideoId);

        Assert.Equal(new[] { "Pr. João", "Pr. João", "Maria" }, SingerNames(snapshot));
    }

    [Fact]
    public void Only_the_first_singer_in_line_can_start()
    {
        var queue = new SongQueue();
        queue.Add(Ana, AnyVideoId);
        queue.Add(Pedro, AnyVideoId);

        Assert.Throws<QueueRuleException>(() => queue.StartNext(Pedro.Id));

        var snapshot = queue.StartNext(Ana.Id);
        Assert.Equal(Ana.Id, snapshot.Current?.SingerId);
        Assert.Single(snapshot.Upcoming);
    }

    [Fact]
    public void Minister_cannot_move_a_song_outside_their_block()
    {
        var queue = new SongQueue();
        queue.Add(PastorJoao, AnyVideoId);
        var snapshot = queue.Add(Ana, AnyVideoId);
        var joaoSong = snapshot.Upcoming[0];

        Assert.Throws<QueueRuleException>(() => queue.MoveDown(joaoSong.Id, PastorJoao.Id));
    }

    private static string[] SingerNames(QueueSnapshot snapshot) =>
        snapshot.Upcoming.Select(entry => entry.SingerName).ToArray();
}
