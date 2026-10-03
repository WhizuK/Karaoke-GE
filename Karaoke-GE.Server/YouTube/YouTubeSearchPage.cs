namespace Karaoke_GE.Server.YouTube;

/// <summary>Uma página de resultados. NextPageToken vazio = não há mais resultados.</summary>
public sealed record YouTubeSearchPage(IReadOnlyList<YouTubeSearchResult> Results, string? NextPageToken);
