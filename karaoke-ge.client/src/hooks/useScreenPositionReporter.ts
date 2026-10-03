import { useEffect } from 'react';
import { reportPosition } from '../services/playbackCommands';
import { YouTubePlayerState, type YouTubePlayer } from '../types/youtube';

const REPORT_INTERVAL_MS = 1000;

export function useScreenPositionReporter(player: YouTubePlayer | null) {
    useEffect(() => {
        if (player === null) {
            return;
        }

        const intervalId = window.setInterval(() => {
            if (player.getPlayerState() === YouTubePlayerState.Playing) {
                reportPosition(player.getCurrentTime());
            }
        }, REPORT_INTERVAL_MS);

        return () => window.clearInterval(intervalId);
    }, [player]);
}
