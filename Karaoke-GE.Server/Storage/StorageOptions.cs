namespace Karaoke_GE.Server.Storage;

public sealed class StorageOptions
{
    public const string SectionName = "Storage";

    /// <summary>Pasta onde ficam a fila, o histórico e os líderes. Relativa à pasta da app.</summary>
    public string DataDirectory { get; init; } = "data";
}
