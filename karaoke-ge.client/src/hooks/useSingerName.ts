import { useState } from 'react';

const STORAGE_KEY = 'karaoke.singerName';

export function useSingerName() {
    const [singerName, setSingerName] = useState<string | null>(readStoredName);

    function saveSingerName(name: string) {
        writeStoredName(name);
        setSingerName(name);
    }

    function clearSingerName() {
        writeStoredName(null);
        setSingerName(null);
    }

    return { singerName, saveSingerName, clearSingerName };
}

function readStoredName(): string | null {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

function writeStoredName(name: string | null) {
    try {
        if (name === null) {
            localStorage.removeItem(STORAGE_KEY);
        } else {
            localStorage.setItem(STORAGE_KEY, name);
        }
    } catch {
        // Modo privado ou armazenamento bloqueado: o nome dura só até fechar a página.
    }
}
