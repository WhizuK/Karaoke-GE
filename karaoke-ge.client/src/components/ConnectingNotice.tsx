import { useEffect, useState } from 'react';

const SLOW_CONNECTION_MS = 8000;

export function ConnectingNotice() {
    const [isSlow, setIsSlow] = useState(false);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => setIsSlow(true), SLOW_CONNECTION_MS);
        return () => window.clearTimeout(timeoutId);
    }, []);

    return (
        <div className="connecting-notice">
            <p>A ligar ao karaoke...</p>
            {isSlow && (
                <p className="muted-text">
                    Está a demorar. Confirma que estás ligado ao Wi-Fi da igreja.
                    Continuamos a tentar automaticamente.
                </p>
            )}
        </div>
    );
}
