using Karaoke_GE.Server.Storage;

namespace Karaoke_GE.Server.Queue;

public sealed class QueueStorage(DataFiles dataFiles)
{
    private const string FileName = "queue.json";

    public QueueSnapshot? Load() => dataFiles.Read<QueueSnapshot?>(FileName, fallback: null);

    public void Save(QueueSnapshot snapshot) => dataFiles.Write(FileName, snapshot);
}
