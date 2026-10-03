using System.Text.RegularExpressions;

namespace Karaoke_GE.Server.Playback;

public static partial class YouTubeVideoId
{
    public static bool IsValid(string? videoId) =>
        videoId is not null && VideoIdPattern().IsMatch(videoId);

    [GeneratedRegex("^[A-Za-z0-9_-]{11}$")]
    private static partial Regex VideoIdPattern();
}
