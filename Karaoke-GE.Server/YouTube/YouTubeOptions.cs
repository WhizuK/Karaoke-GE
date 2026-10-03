namespace Karaoke_GE.Server.YouTube;

public sealed class YouTubeOptions
{
    public const string SectionName = "YouTube";

    /// <summary>Chave da YouTube Data API. Vazia = pesquisa desligada (colar links continua a funcionar).</summary>
    public string ApiKey { get; init; } = string.Empty;
}
