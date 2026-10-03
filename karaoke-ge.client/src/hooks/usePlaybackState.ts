import { useEffect, useState } from 'react';
import { karaokeConnection } from '../services/karaokeConnection';
import { fetchPlaybackState } from '../services/playbackCommands';
import type { PlaybackState } from '../types/playback';

export function usePlaybackState(): PlaybackState | null {
    const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null);

    useEffect(() => {
        karaokeConnection.on('PlaybackChanged', setPlaybackState);

        fetchPlaybackState()
            .then(setPlaybackState)
            .catch(error => console.error('Falha ao obter o estado do vídeo', error));

        return () => karaokeConnection.off('PlaybackChanged', setPlaybackState);
    }, []);

    return playbackState;
}
