import { pause, play, seekBy, seekTo, stop } from '../../services/playbackCommands';
import { startNextSong } from '../../services/queueCommands';
import type { PlaybackState } from '../../types/playback';
import type { QueueEntry } from '../../types/queue';
import { youTubeThumbnailUrl } from '../../utils/youtubeThumbnail';
import { PlaybackControls } from '../PlaybackControls';
import { VolumeSlider } from './VolumeSlider';

type AdminNowPlayingProps = {
    current: QueueEntry | null;
    next: QueueEntry | undefined;
    playbackState: PlaybackState | null;
    onAction: (action: () => Promise<void>) => void;
};

export function AdminNowPlaying({ current, next, playbackState, onAction }: AdminNowPlayingProps) {
    return (
        <div className="admin-now-playing">
            {current !== null && playbackState !== null
                ? (
                    <>
                        <div className="admin-song">
                            <img src={youTubeThumbnailUrl(current.videoId)} alt="" />
                            <div>
                                <p className="admin-song-singer">{current.singerName}</p>
                                <p className="muted-text">{current.title}</p>
                            </div>
                        </div>
                        <PlaybackControls
                            isPlaying={playbackState.isPlaying}
                            onPlay={play}
                            onPause={pause}
                            onSeekBy={seekBy}
                            onRestart={() => seekTo(0)}
                            onStop={stop}
                        />
                    </>
                )
                : <p className="muted-text">Nenhuma música a tocar.</p>}

            {current === null && next !== undefined && (
                <button type="button" className="button-gold" onClick={() => onAction(startNextSong)}>
                    Começar a música de {next.singerName}
                </button>
            )}

            {playbackState !== null && <VolumeSlider volume={playbackState.volume} />}
        </div>
    );
}
