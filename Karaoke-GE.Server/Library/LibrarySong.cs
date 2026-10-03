namespace Karaoke_GE.Server.Library;

public sealed record LibrarySong(string VideoId, string Title, int TimesSung, DateTimeOffset LastSungAt);
