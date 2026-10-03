using System.Text.Json;
using Microsoft.Extensions.Options;

namespace Karaoke_GE.Server.Storage;

/// <summary>
/// Lê e grava pequenos ficheiros JSON na pasta de dados.
/// Serve para a app não perder nada se for fechada ou se o PC reiniciar.
/// </summary>
public sealed class DataFiles(
    IOptions<StorageOptions> options,
    IHostEnvironment environment,
    ILogger<DataFiles> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true,
    };

    private readonly Lock _lock = new();
    private readonly string _directory = Path.Combine(environment.ContentRootPath, options.Value.DataDirectory);

    public T Read<T>(string fileName, T fallback)
    {
        var path = Path.Combine(_directory, fileName);

        lock (_lock)
        {
            if (!File.Exists(path))
            {
                return fallback;
            }

            try
            {
                var value = JsonSerializer.Deserialize<T>(File.ReadAllText(path), JsonOptions);
                return value is null ? fallback : value;
            }
            catch (Exception exception) when (exception is JsonException or IOException)
            {
                // Um ficheiro estragado não pode impedir a app de arrancar.
                logger.LogError(exception, "Não foi possível ler {Path}. A começar sem esses dados.", path);
                return fallback;
            }
        }
    }

    public void Write<T>(string fileName, T value)
    {
        var path = Path.Combine(_directory, fileName);
        var temporaryPath = path + ".tmp";

        lock (_lock)
        {
            try
            {
                Directory.CreateDirectory(_directory);

                // Escrever primeiro num ficheiro temporário e só depois substituir:
                // se o PC se desligar a meio, o ficheiro antigo continua inteiro.
                File.WriteAllText(temporaryPath, JsonSerializer.Serialize(value, JsonOptions));
                File.Move(temporaryPath, path, overwrite: true);
            }
            catch (Exception exception) when (exception is IOException or UnauthorizedAccessException)
            {
                logger.LogError(exception, "Não foi possível gravar {Path}.", path);
            }
        }
    }
}
