export type YouTubePlayer = {
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    loadVideoById(videoId: string, startSeconds?: number): void;
    cueVideoById(videoId: string, startSeconds?: number): void;
    getCurrentTime(): number;
    getPlayerState(): number;
    setVolume(volume: number): void;
    mute(): void;
    destroy(): void;
};

export type YouTubePlayerOptions = {
    width?: string;
    height?: string;
    playerVars?: Record<string, number | string>;
    events?: {
        onReady?: (event: { target: YouTubePlayer }) => void;
        onStateChange?: (event: { data: number; target: YouTubePlayer }) => void;
    };
};

export type YouTubePlayerConstructor = new (
    element: HTMLElement,
    options: YouTubePlayerOptions,
) => YouTubePlayer;

export const YouTubePlayerState = {
    Ended: 0,
    Playing: 1,
    Paused: 2,
} as const;
