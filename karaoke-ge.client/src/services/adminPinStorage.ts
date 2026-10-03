import { readStoredItem, writeStoredItem } from '../utils/storage';

const PIN_STORAGE_KEY = 'karaoke.adminPin';

export function readAdminPin(): string | null {
    return readStoredItem(PIN_STORAGE_KEY);
}

export function saveAdminPin(pin: string) {
    writeStoredItem(PIN_STORAGE_KEY, pin);
}

export function clearAdminPin() {
    writeStoredItem(PIN_STORAGE_KEY, null);
}

/** Este aparelho já entrou como admin (e ainda não saiu). */
export function isAdminDevice(): boolean {
    return readAdminPin() !== null;
}
