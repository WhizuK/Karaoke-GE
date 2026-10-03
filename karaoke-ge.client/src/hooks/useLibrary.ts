import { useEffect, useState } from 'react';
import { karaokeConnection, onReconnected } from '../services/karaokeConnection';
import { fetchLibrary } from '../services/libraryCommands';
import type { LibrarySong } from '../types/library';

export function useLibrary(): LibrarySong[] {
    const [songs, setSongs] = useState<LibrarySong[]>([]);

    useEffect(() => {
        function loadLibrary() {
            fetchLibrary()
                .then(setSongs)
                .catch(error => console.error('Falha ao obter as músicas da igreja', error));
        }

        karaokeConnection.on('LibraryChanged', setSongs);
        loadLibrary();
        const stopListeningReconnect = onReconnected(loadLibrary);

        return () => {
            karaokeConnection.off('LibraryChanged', setSongs);
            stopListeningReconnect();
        };
    }, []);

    return songs;
}
