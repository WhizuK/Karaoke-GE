import { useEffect } from 'react';
import { karaokeConnection } from '../services/karaokeConnection';
import type { YouTubePlayer } from '../types/youtube';

const SYNC_TOLERANCE_SECONDS = 0.5;

export function useMirrorPositionSync(player: YouTubePlayer | null) {
    useEffect(() => {
        if (player === null) {
            return;
        }

        const handlePositionReported = (positionSeconds: number) => {
            const drift = Math.abs(player.getCurrentTime() - positionSeconds);
            if (drift > SYNC_TOLERANCE_SECONDS) {
                player.seekTo(positionSeconds, true);
            }
        };

        karaokeConnection.on('PositionReported', handlePositionReported);
        return () => karaokeConnection.off('PositionReported', handlePositionReported);
    }, [player]);
}
