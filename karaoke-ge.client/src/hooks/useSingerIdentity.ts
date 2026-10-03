import { useState } from 'react';
import type { SingerIdentity } from '../types/singer';
import { readStoredItem, writeStoredItem } from '../utils/storage';
import { createUuid } from '../utils/uuid';

const ID_STORAGE_KEY = 'karaoke.singerId';
const NAME_STORAGE_KEY = 'karaoke.singerName';

export function useSingerIdentity() {
    const [singerId] = useState(getOrCreateSingerId);
    const [name, setName] = useState<string | null>(() => readStoredItem(NAME_STORAGE_KEY));

    function saveName(newName: string) {
        writeStoredItem(NAME_STORAGE_KEY, newName);
        setName(newName);
    }

    function clearName() {
        writeStoredItem(NAME_STORAGE_KEY, null);
        setName(null);
    }

    const identity: SingerIdentity | null = name === null ? null : { id: singerId, name };

    return { identity, saveName, clearName };
}

function getOrCreateSingerId(): string {
    const storedId = readStoredItem(ID_STORAGE_KEY);
    if (storedId !== null) {
        return storedId;
    }

    const newId = createUuid();
    writeStoredItem(ID_STORAGE_KEY, newId);
    return newId;
}
