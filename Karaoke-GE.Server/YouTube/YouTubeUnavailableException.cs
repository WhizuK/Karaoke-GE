namespace Karaoke_GE.Server.YouTube;

/// <summary>O YouTube recusou o pedido (limite diário atingido ou chave inválida).</summary>
public sealed class YouTubeUnavailableException() : Exception("A YouTube Data API recusou o pedido.");
