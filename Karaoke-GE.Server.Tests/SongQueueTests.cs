using Karaoke_GE.Server.Queue;
using Karaoke_GE.Server.Singers;

namespace Karaoke_GE.Server.Tests;

public class SongQueueTests
{
    private const string AnyVideoId = "dQw4w9WgXcQ";

    private static readonly Singer Ana = new(Guid.NewGuid(), "Ana", IsLeader: false);
    private static readonly Singer Pedro = new(Guid.NewGuid(), "Pedro", IsLeader: false);
    private static readonly Singer PastorJoao = new(Guid.NewGuid(), "Pr. João", IsLeader: true);
    private static readonly Singer Maria = new(Guid.NewGuid(), "Maria", IsLeader: true);

    // ---------- Regras dos cantores ----------

    [Fact]
    public void Regular_singer_cannot_have_two_songs_waiting()
    {
        var queue = new SongQueue();
        queue.Add(Ana, AnyVideoId);

        Assert.Throws<RuleViolationException>(() => queue.Add(Ana, AnyVideoId));
    }

    [Fact]
    public void Leader_can_add_several_songs()
    {
        var queue = new SongQueue();
        queue.Add(PastorJoao, AnyVideoId);
        queue.Add(PastorJoao, AnyVideoId);
        var snapshot = queue.Add(PastorJoao, AnyVideoId);

        Assert.Equal(3, snapshot.Upcoming.Count);
    }

    [Fact]
    public void Leader_songs_go_before_regular_singers()
    {
        var queue = new SongQueue();
        queue.Add(Ana, AnyVideoId);
        queue.Add(Pedro, AnyVideoId);
        queue.Add(PastorJoao, AnyVideoId);
        var snapshot = queue.Add(PastorJoao, AnyVideoId);

        Assert.Equal(new[] { "Pr. João", "Pr. João", "Ana", "Pedro" }, SingerNames(snapshot));
    }

    [Fact]
    public void Leaders_keep_arrival_order_and_their_blocks_together()
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

        Assert.Throws<RuleViolationException>(() => queue.StartNext(Requester.ForSinger(Pedro.Id)));

        var snapshot = queue.StartNext(Requester.ForSinger(Ana.Id));
        Assert.Equal(Ana.Id, snapshot.Current?.SingerId);
        Assert.Single(snapshot.Upcoming);
    }

    [Fact]
    public void Leader_cannot_move_a_song_outside_their_block()
    {
        var queue = new SongQueue();
        queue.Add(PastorJoao, AnyVideoId);
        var snapshot = queue.Add(Ana, AnyVideoId);
        var joaoSong = snapshot.Upcoming[0];

        Assert.Throws<RuleViolationException>(() => queue.MoveDown(joaoSong.Id, Requester.ForSinger(PastorJoao.Id)));
    }

    [Fact]
    public void Singer_cannot_remove_someone_elses_song()
    {
        var queue = new SongQueue();
        var snapshot = queue.Add(Ana, AnyVideoId);
        var anaSong = snapshot.Upcoming[0];

        Assert.Throws<RuleViolationException>(() => queue.Remove(anaSong.Id, Requester.ForSinger(Pedro.Id)));
    }

    // ---------- Regras do admin ----------

    [Fact]
    public void Admin_can_start_the_song_for_whoever_is_next()
    {
        var queue = new SongQueue();
        queue.Add(Ana, AnyVideoId);

        var snapshot = queue.StartNext(Requester.Admin);

        Assert.Equal(Ana.Id, snapshot.Current?.SingerId);
    }

    [Fact]
    public void Admin_can_move_any_song_across_blocks()
    {
        var queue = new SongQueue();
        queue.Add(PastorJoao, AnyVideoId);
        var snapshot = queue.Add(Ana, AnyVideoId);
        var anaSong = snapshot.Upcoming[1];

        snapshot = queue.MoveUp(anaSong.Id, Requester.Admin);

        Assert.Equal(new[] { "Ana", "Pr. João" }, SingerNames(snapshot));
    }

    [Fact]
    public void Admin_can_remove_any_song()
    {
        var queue = new SongQueue();
        var snapshot = queue.Add(Ana, AnyVideoId);

        snapshot = queue.Remove(snapshot.Upcoming[0].Id, Requester.Admin);

        Assert.Empty(snapshot.Upcoming);
    }

    private static string[] SingerNames(QueueSnapshot snapshot) =>
        snapshot.Upcoming.Select(entry => entry.SingerName).ToArray();
}
