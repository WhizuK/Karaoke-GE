import { useConnectedDevices } from '../hooks/useConnectedDevices';
import { useMirrorPositionSync } from '../hooks/useMirrorPositionSync';
import { usePlaybackState } from '../hooks/usePlaybackState';
import { usePlaybackSync } from '../hooks/usePlaybackSync';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { loadVideo, pause, play, seekTo, stop } from '../services/playbackCommands';
import { PlaybackControls } from './PlaybackControls';
import { VideoLinkForm } from './VideoLinkForm';

type SingerViewProps = {
    singerName: string;
    onChangeName: () => void;
};

export function SingerView({ singerName, onChangeName }: SingerViewProps) {
    const connectedDevices = useConnectedDevices();
    const playbackState = usePlaybackState();
    const { containerRef, player } = useYouTubePlayer({ muted: true });

    usePlaybackSync(player, playbackState);
    useMirrorPositionSync(player);

    const hasVideo = playbackState?.videoId != null;

    function seekBy(deltaSeconds: number) {
        if (player !== null) {
            seekTo(player.getCurrentTime() + deltaSeconds);
        }
    }

    return (
        <>
            <header className="singer-header">
                <h1>Olá, {singerName}!</h1>
                <button type="button" className="link-button" onClick={onChangeName}>
                    Trocar nome
                </button>
            </header>

            <div className="phone-video">
                <div ref={containerRef} className="video-frame" />
                {!hasVideo && <p className="video-placeholder">Nenhuma música a tocar</p>}
            </div>

            {hasVideo && (
                <PlaybackControls
                    isPlaying={playbackState.isPlaying}
                    onPlay={play}
                    onPause={pause}
                    onSeekBy={seekBy}
                    onRestart={() => seekTo(0)}
                    onStop={stop}
                />
            )}

            <VideoLinkForm onVideoSelected={loadVideo} />

            <p className="muted-text">Dispositivos ligados: {connectedDevices}</p>
        </>
    );
}
