import { useState } from 'react';

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 30;

type JoinFormProps = {
    onJoin: (name: string) => void;
};

export function JoinForm({ onJoin }: JoinFormProps) {
    const [name, setName] = useState('');
    const trimmedName = name.trim();
    const isValid = trimmedName.length >= MIN_NAME_LENGTH;

    return (
        <form
            className="stack-form"
            onSubmit={event => {
                event.preventDefault();
                if (isValid) {
                    onJoin(trimmedName);
                }
            }}
        >
            <label htmlFor="singer-name">Como te chamas?</label>
            <input
                id="singer-name"
                value={name}
                onChange={event => setName(event.target.value)}
                maxLength={MAX_NAME_LENGTH}
                autoComplete="given-name"
                autoFocus
            />
            <button type="submit" className="button-primary" disabled={!isValid}>
                Entrar
            </button>
        </form>
    );
}
