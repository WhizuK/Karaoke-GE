import { useEffect, useState } from 'react';
import { loginAsAdmin } from '../services/adminCommands';
import { getUserMessage } from '../utils/hubError';
import { readStoredItem, writeStoredItem } from '../utils/storage';

const PIN_STORAGE_KEY = 'karaoke.adminPin';

type AdminStatus = 'checking' | 'logged-out' | 'logged-in';

export function useAdminSession() {
    const [status, setStatus] = useState<AdminStatus>(() =>
        readStoredItem(PIN_STORAGE_KEY) === null ? 'logged-out' : 'checking',
    );
    const [error, setError] = useState<string | null>(null);

    // Este telemóvel já entrou antes: tentamos com o PIN guardado.
    useEffect(() => {
        const storedPin = readStoredItem(PIN_STORAGE_KEY);
        if (storedPin === null) {
            return;
        }

        loginAsAdmin(storedPin)
            .then(() => setStatus('logged-in'))
            .catch(() => {
                writeStoredItem(PIN_STORAGE_KEY, null);
                setStatus('logged-out');
            });
    }, []);

    async function login(pin: string) {
        setError(null);
        try {
            await loginAsAdmin(pin);
            writeStoredItem(PIN_STORAGE_KEY, pin);
            setStatus('logged-in');
        } catch (loginError) {
            setError(getUserMessage(loginError));
        }
    }

    function logout() {
        writeStoredItem(PIN_STORAGE_KEY, null);
        // Recarregar cria uma ligação nova, que já não é admin.
        window.location.reload();
    }

    return { status, error, login, logout };
}
