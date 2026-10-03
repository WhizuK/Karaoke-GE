namespace Karaoke_GE.Server.YouTube;

public static class YouTubeEndpoints
{
    private const int MinQueryLength = 2;

    public static IEndpointRouteBuilder MapYouTubeEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/youtube/search", SearchAsync);
        return app;
    }

    private static async Task<IResult> SearchAsync(
        string? q,
        bool? karaoke,
        string? pageToken,
        YouTubeClient youTubeClient,
        CancellationToken cancellationToken)
    {
        var query = q?.Trim() ?? string.Empty;

        if (query.Length < MinQueryLength)
        {
            return Results.Problem($"Escreve pelo menos {MinQueryLength} letras.", statusCode: StatusCodes.Status400BadRequest);
        }

        if (!youTubeClient.IsSearchEnabled)
        {
            return Unavailable("A pesquisa ainda não está configurada. Cola o link da música.");
        }

        try
        {
            var page = await youTubeClient.SearchAsync(query, karaoke ?? false, pageToken, cancellationToken);
            return Results.Ok(page);
        }
        catch (YouTubeUnavailableException)
        {
            return Unavailable("A pesquisa do YouTube não está disponível agora. Cola o link da música.");
        }
        catch (HttpRequestException)
        {
            return Unavailable("Não foi possível falar com o YouTube. Confirma a internet do PC da igreja.");
        }
    }

    private static IResult Unavailable(string message) =>
        Results.Problem(message, statusCode: StatusCodes.Status503ServiceUnavailable);
}
