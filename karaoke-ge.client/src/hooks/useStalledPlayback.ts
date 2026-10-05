import { useEffect, useState } from 'react';
import { YouTubePlayerState, type YouTubePlayer } from '../types/youtube';

const STALL_GRACE_MS = 1000;
const CHECK_INTERVAL_MS = 250;

/**
 * Diz se o vídeo devia estar a tocar mas está parado há mais de 1 segundo.
 * Acontece no iPhone com o modo de poupança de bateria: o Safari bloqueia vídeos
 * que arrancam sozinhos, mesmo sem som, e só os deixa tocar depois de um toque.
 */
export function useStalledPlayback(player: YouTubePlayer | null, shouldBePlaying: boolean): boolean {
    const [isStalled, setIsStalled] = useState(false);

    useEffect(() => {
        if (player === null || !shouldBePlaying) {
            return;
        }

        let notPlayingSince: number | null = null;

        const intervalId = window.setInterval(() => {
            const state = player.getPlayerState();

            // A carregar (buffering) não conta: a internet pode só estar lenta.
            if (state === YouTubePlayerState.Playing || state === YouTubePlayerState.Buffering) {
                notPlayingSince = null;
                setIsStalled(false);
                return;
            }

            notPlayingSince ??= Date.now();
            if (Date.now() - notPlayingSince >= STALL_GRACE_MS) {
                setIsStalled(true);
            }
        }, CHECK_INTERVAL_MS);

        return () => {
            window.clearInterval(intervalId);
            setIsStalled(false);
        };
    }, [player, shouldBePlaying]);

    return isStalled;
}
