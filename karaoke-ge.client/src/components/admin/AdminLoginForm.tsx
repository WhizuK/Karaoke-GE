import { useState } from 'react';

type AdminLoginFormProps = {
    error: string | null;
    onLogin: (pin: string) => Promise<void>;
};

export function AdminLoginForm({ error, onLogin }: AdminLoginFormProps) {
    const [pin, setPin] = useState('');
    const [isSending, setIsSending] = useState(false);

    async function submit() {
        setIsSending(true);
        await onLogin(pin);
        setIsSending(false);
        setPin('');
    }

    return (
        <form
            className="stack-form admin-login"
            onSubmit={event => {
                event.preventDefault();
                void submit();
            }}
        >
            <label htmlFor="admin-pin">PIN do admin</label>
            <input
                id="admin-pin"
                type="password"
                inputMode="numeric"
                autoComplete="current-password"
                value={pin}
                onChange={event => setPin(event.target.value)}
                autoFocus
            />
            <button type="submit" className="button-primary" disabled={pin === '' || isSending}>
                {isSending ? 'A entrar...' : 'Entrar'}
            </button>
            {error !== null && (
                <p className="form-error" role="alert">
                    {error}
                </p>
            )}
        </form>
    );
}
