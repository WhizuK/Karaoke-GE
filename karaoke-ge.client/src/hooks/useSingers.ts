import { useEffect, useState } from 'react';
import { fetchSingers } from '../services/adminCommands';
import { karaokeConnection, onReconnected } from '../services/karaokeConnection';
import type { Singer } from '../types/singer';

export function useSingers(): Singer[] {
    const [singers, setSingers] = useState<Singer[]>([]);

    useEffect(() => {
        function loadSingers() {
            fetchSingers()
                .then(setSingers)
                .catch(error => console.error('Falha ao obter as pessoas ligadas', error));
        }

        karaokeConnection.on('SingersChanged', setSingers);
        loadSingers();
        const stopListeningReconnect = onReconnected(loadSingers);

        return () => {
            karaokeConnection.off('SingersChanged', setSingers);
            stopListeningReconnect();
        };
    }, []);

    return singers;
}
