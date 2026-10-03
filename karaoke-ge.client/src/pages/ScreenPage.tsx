import { useState } from 'react';
import { KaraokeScreen } from '../components/KaraokeScreen';

export function ScreenPage() {
    const [isActivated, setIsActivated] = useState(false);

    if (!isActivated) {
        return (
            <main className="screen-activation">
                <button type="button" className="activate-button" onClick={() => setIsActivated(true)}>
                    Clique para ligar o ecrã do karaoke
                </button>
            </main>
        );
    }

    return <KaraokeScreen />;
}
