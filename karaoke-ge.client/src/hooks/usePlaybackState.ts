import { useEffect, useState } from 'react';
import { karaokeConnection, onReconnected } from '../services/karaokeConnection';
import { fetchPlaybackState } from '../services/playbackCommands';
import type { PlaybackState } from '../types/playback';

export function usePlaybackState(): PlaybackState | null {
    const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null);

    useEffect(() => {
        function loadPlaybackState() {
            fetchPlaybackState()
                .then(setPlaybackState)
                .catch(error => console.error('Falha ao obter o estado do vídeo', error));
        }

        karaokeConnection.on('PlaybackChanged', setPlaybackState);
        loadPlaybackState();
        const stopListeningReconnect = onReconnected(loadPlaybackState);

        return () => {
            karaokeConnection.off('PlaybackChanged', setPlaybackState);
            stopListeningReconnect();
        };
    }, []);

    return playbackState;
}
