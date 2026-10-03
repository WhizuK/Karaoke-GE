namespace Karaoke_GE.Server;

/// <summary>
/// Uma regra do karaoke foi violada (ex.: "Já tens uma música na fila").
/// A mensagem é pensada para ser mostrada ao utilizador.
/// </summary>
public sealed class RuleViolationException(string message) : Exception(message);
