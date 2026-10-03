const SEEK_STEP_SECONDS = 10;

type PlaybackControlsProps = {
    isPlaying: boolean;
    onPlay: () => void;
    onPause: () => void;
    onSeekBy: (deltaSeconds: number) => void;
    onRestart: () => void;
    onStop: () => void;
};

export function PlaybackControls({
    isPlaying,
    onPlay,
    onPause,
    onSeekBy,
    onRestart,
    onStop,
}: PlaybackControlsProps) {
    return (
        <div className="playback-controls">
            <button type="button" onClick={() => onSeekBy(-SEEK_STEP_SECONDS)}>
                « {SEEK_STEP_SECONDS}s
            </button>
            <button type="button" className="primary" onClick={isPlaying ? onPause : onPlay}>
                {isPlaying ? 'Pausa' : 'Tocar'}
            </button>
            <button type="button" onClick={() => onSeekBy(SEEK_STEP_SECONDS)}>
                {SEEK_STEP_SECONDS}s »
            </button>
            <button type="button" onClick={onRestart}>
                Recomeçar
            </button>
            <button type="button" className="danger" onClick={onStop}>
                Terminar
            </button>
        </div>
    );
}
