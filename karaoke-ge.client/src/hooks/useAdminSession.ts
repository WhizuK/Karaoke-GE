import { useEffect, useState } from 'react';
import { loginAsAdmin } from '../services/adminCommands';
import { clearAdminPin, readAdminPin, saveAdminPin } from '../services/adminPinStorage';
import { getUserMessage } from '../utils/hubError';

type AdminStatus = 'checking' | 'logged-out' | 'logged-in';

export function useAdminSession() {
    const [status, setStatus] = useState<AdminStatus>(() =>
        readAdminPin() === null ? 'logged-out' : 'checking',
    );
    const [error, setError] = useState<string | null>(null);

    // Este aparelho já entrou antes: tentamos com o PIN guardado.
    useEffect(() => {
        const storedPin = readAdminPin();
        if (storedPin === null) {
            return;
        }

        loginAsAdmin(storedPin)
            .then(() => setStatus('logged-in'))
            .catch(() => {
                clearAdminPin();
                setStatus('logged-out');
            });
    }, []);

    async function login(pin: string) {
        setError(null);
        try {
            await loginAsAdmin(pin);
            saveAdminPin(pin);
            setStatus('logged-in');
        } catch (loginError) {
            setError(getUserMessage(loginError));
        }
    }

    function logout() {
        clearAdminPin();
        // Carregar a página de novo cria uma ligação nova, que já não é admin.
        window.location.assign('/');
    }

    return { status, error, login, logout };
}
