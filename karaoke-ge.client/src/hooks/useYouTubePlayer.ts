import { useEffect, useRef, useState } from 'react';
import { loadYouTubeIframeApi } from '../services/youtubeIframeApi';
import { YouTubePlayerState, type YouTubePlayer } from '../types/youtube';

type UseYouTubePlayerOptions = {
    muted: boolean;
    onEnded?: () => void;
};

export function useYouTubePlayer({ muted, onEnded }: UseYouTubePlayerOptions) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [player, setPlayer] = useState<YouTubePlayer | null>(null);
    const onEndedRef = useRef(onEnded);

    useEffect(() => {
        onEndedRef.current = onEnded;
    });

    useEffect(() => {
        const container = containerRef.current;
        if (container === null) {
            return;
        }

        const playerHost = document.createElement('div');
        container.append(playerHost);

        let createdPlayer: YouTubePlayer | null = null;
        let isCancelled = false;

        loadYouTubeIframeApi().then(Player => {
            if (isCancelled) {
                return;
            }

            createdPlayer = new Player(playerHost, {
                width: '100%',
                height: '100%',
                playerVars: { playsinline: 1, controls: 0, rel: 0, disablekb: 1 },
                events: {
                    onReady: event => {
                        if (muted) {
                            event.target.mute();
                        }
                        setPlayer(event.target);
                    },
                    onStateChange: event => {
                        if (event.data === YouTubePlayerState.Ended) {
                            onEndedRef.current?.();
                        }
                    },
                },
            });
        });

        return () => {
            isCancelled = true;
            createdPlayer?.destroy();
            container.replaceChildren();
            setPlayer(null);
        };
    }, [muted]);

    return { containerRef, player };
}
