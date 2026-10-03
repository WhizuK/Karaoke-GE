import { useConnectedDevices } from '../hooks/useConnectedDevices';
import { useJoinUrl } from '../hooks/useJoinUrl';
import { usePlaybackState } from '../hooks/usePlaybackState';
import { usePlaybackSync } from '../hooks/usePlaybackSync';
import { useScreenPositionReporter } from '../hooks/useScreenPositionReporter';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { stop } from '../services/playbackCommands';
import { JoinQrCode } from './JoinQrCode';

export function KaraokeScreen() {
    const connectedDevices = useConnectedDevices();
    const joinUrl = useJoinUrl();
    const playbackState = usePlaybackState();
    const { containerRef, player } = useYouTubePlayer({ muted: false, onEnded: stop });

    usePlaybackSync(player, playbackState);
    useScreenPositionReporter(player);

    const hasVideo = playbackState?.videoId != null;

    return (
        <main className="screen-page">
            <div ref={containerRef} className="video-frame" />

            {!hasVideo && (
                <div className="screen-idle">
                    <h1>Karaoke GE</h1>
                    {joinUrl !== null
                        ? <JoinQrCode url={joinUrl} />
                        : <p>A procurar a rede local...</p>}
                    <p className="muted-text">Dispositivos ligados: {connectedDevices}</p>
                </div>
            )}
        </main>
    );
}
