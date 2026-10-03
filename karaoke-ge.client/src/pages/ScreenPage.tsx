import { useState } from 'react';
import { KaraokeScreen } from '../components/KaraokeScreen';

export function ScreenPage() {
    const [isActivated, setIsActivated] = useState(false);

    if (!isActivated) {
        return (
            <main className="screen-activation">
                <h1>Karaoke GE</h1>
                <button type="button" className="button-gold is-huge" onClick={() => setIsActivated(true)}>
                    Ligar o ecrã do karaoke
                </button>
                <p className="muted-text">O browser só deixa tocar som depois deste clique.</p>
            </main>
        );
    }

    return <KaraokeScreen />;
}
