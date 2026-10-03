namespace Karaoke_GE.Server.Admin;

public sealed class AdminOptions
{
    public const string SectionName = "Admin";
    public const int MinPinLength = 4;

    public string Pin { get; init; } = string.Empty;
}
