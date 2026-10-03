using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace Karaoke_GE.Server.YouTube;

public sealed class YouTubeClient(
    HttpClient httpClient,
    IMemoryCache cache,
    IOptions<YouTubeOptions> options,
    ILogger<YouTubeClient> logger)
{
    private const int MaxResults = 10;
    private const string KaraokeSuffix = " karaoke";
    private const string FallbackTitle = "Música do YouTube";

    // Cada pesquisa gasta 100 unidades da quota diária: pesquisas repetidas vêm da memória.
    private static readonly TimeSpan SearchCacheDuration = TimeSpan.FromHours(6);
    private static readonly TimeSpan TitleCacheDuration = TimeSpan.FromDays(1);

    public bool IsSearchEnabled => !string.IsNullOrWhiteSpace(options.Value.ApiKey);

    /// <param name="pageToken">Vazio para a primeira página; o NextPageToken anterior para "carregar mais".</param>
    public async Task<YouTubeSearchPage> SearchAsync(
        string query,
        bool onlyKaraoke,
        string? pageToken,
        CancellationToken cancellationToken)
    {
        var fullQuery = onlyKaraoke ? query + KaraokeSuffix : query;
        var cacheKey = $"youtube-search:{fullQuery.ToLowerInvariant()}:{pageToken}";

        if (cache.TryGetValue(cacheKey, out YouTubeSearchPage? cachedPage) && cachedPage is not null)
        {
            return cachedPage;
        }

        var url = "https://www.googleapis.com/youtube/v3/search"
            + "?part=snippet&type=video&videoEmbeddable=true&safeSearch=strict&relevanceLanguage=pt"
            + $"&maxResults={MaxResults}"
            + $"&q={Uri.EscapeDataString(fullQuery)}"
            + $"&key={Uri.EscapeDataString(options.Value.ApiKey)}";

        if (!string.IsNullOrEmpty(pageToken))
        {
            url += $"&pageToken={Uri.EscapeDataString(pageToken)}";
        }

        using var response = await httpClient.GetAsync(url, cancellationToken);

        if (response.StatusCode is HttpStatusCode.Forbidden or HttpStatusCode.BadRequest)
        {
            throw new YouTubeUnavailableException();
        }

        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<SearchResponse>(cancellationToken);
        IReadOnlyList<YouTubeSearchResult> results = (body?.Items ?? Array.Empty<SearchItem>())
            .Where(item => item.Id.VideoId is not null)
            .Select(item => new YouTubeSearchResult(
                item.Id.VideoId!,
                WebUtility.HtmlDecode(item.Snippet.Title),
                WebUtility.HtmlDecode(item.Snippet.ChannelTitle)))
            .ToArray();

        var page = new YouTubeSearchPage(results, body?.NextPageToken);
        cache.Set(cacheKey, page, SearchCacheDuration);
        return page;
    }

    /// <summary>
    /// Vai buscar o título pelo serviço oEmbed do YouTube, que não gasta quota.
    /// Também confirma que o vídeo existe e pode ser tocado fora do YouTube.
    /// </summary>
    public async Task<string> GetTitleAsync(string videoId, CancellationToken cancellationToken)
    {
        var cacheKey = $"youtube-title:{videoId}";
        if (cache.TryGetValue(cacheKey, out string? cachedTitle) && cachedTitle is not null)
        {
            return cachedTitle;
        }

        var videoUrl = $"https://www.youtube.com/watch?v={videoId}";
        var url = $"https://www.youtube.com/oembed?format=json&url={Uri.EscapeDataString(videoUrl)}";

        try
        {
            using var response = await httpClient.GetAsync(url, cancellationToken);

            if (response.StatusCode is HttpStatusCode.Unauthorized or HttpStatusCode.Forbidden)
            {
                throw new RuleViolationException(
                    "O dono deste vídeo não deixa tocá-lo fora do YouTube. Escolhe outra versão.");
            }

            if (response.StatusCode is HttpStatusCode.NotFound or HttpStatusCode.BadRequest)
            {
                throw new RuleViolationException("Esse vídeo não existe ou foi apagado.");
            }

            response.EnsureSuccessStatusCode();

            var oEmbed = await response.Content.ReadFromJsonAsync<OEmbedResponse>(cancellationToken);
            var title = string.IsNullOrWhiteSpace(oEmbed?.Title) ? FallbackTitle : oEmbed.Title;

            cache.Set(cacheKey, title, TitleCacheDuration);
            return title;
        }
        catch (HttpRequestException exception)
        {
            // Sem internet ou YouTube em baixo: a música entra na fila na mesma.
            logger.LogWarning(exception, "Não foi possível obter o título do vídeo {VideoId}", videoId);
            return FallbackTitle;
        }
    }

    private sealed record SearchResponse(IReadOnlyList<SearchItem>? Items, string? NextPageToken);

    private sealed record SearchItem(SearchItemId Id, SearchSnippet Snippet);

    private sealed record SearchItemId(string? VideoId);

    private sealed record SearchSnippet(string Title, string ChannelTitle);

    private sealed record OEmbedResponse(string? Title);
}
