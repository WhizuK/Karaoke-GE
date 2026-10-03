import { useEffect, useState } from 'react';
import { karaokeConnection, onReconnected } from '../services/karaokeConnection';
import { fetchQueue } from '../services/queueCommands';
import type { QueueSnapshot } from '../types/queue';

export function useQueue(): QueueSnapshot | null {
    const [queue, setQueue] = useState<QueueSnapshot | null>(null);

    useEffect(() => {
        function loadQueue() {
            fetchQueue()
                .then(setQueue)
                .catch(error => console.error('Falha ao obter a fila', error));
        }

        karaokeConnection.on('QueueChanged', setQueue);
        loadQueue();
        const stopListeningReconnect = onReconnected(loadQueue);

        return () => {
            karaokeConnection.off('QueueChanged', setQueue);
            stopListeningReconnect();
        };
    }, []);

    return queue;
}
