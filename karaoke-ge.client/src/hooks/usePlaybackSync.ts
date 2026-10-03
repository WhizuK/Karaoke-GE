import { useEffect, useRef } from 'react';
import type { PlaybackState } from '../types/playback';
import type { YouTubePlayer } from '../types/youtube';

const SEEK_TOLERANCE_SECONDS = 1.5;

export function usePlaybackSync(player: YouTubePlayer | null, playbackState: PlaybackState | null) {
    const loadedVideoIdRef = useRef<string | null>(null);

    useEffect(() => {
        loadedVideoIdRef.current = null;
    }, [player]);

    useEffect(() => {
        if (player === null || playbackState === null) {
            return;
        }

        const { videoId, isPlaying, positionSeconds } = playbackState;

        if (videoId === null) {
            player.stopVideo();
            loadedVideoIdRef.current = null;
            return;
        }

        if (loadedVideoIdRef.current !== videoId) {
            if (isPlaying) {
                player.loadVideoById(videoId, positionSeconds);
            } else {
                player.cueVideoById(videoId, positionSeconds);
            }
            loadedVideoIdRef.current = videoId;
            return;
        }

        if (Math.abs(player.getCurrentTime() - positionSeconds) > SEEK_TOLERANCE_SECONDS) {
            player.seekTo(positionSeconds, true);
        }

        if (isPlaying) {
            player.playVideo();
        } else {
            player.pauseVideo();
        }
    }, [player, playbackState]);
}
