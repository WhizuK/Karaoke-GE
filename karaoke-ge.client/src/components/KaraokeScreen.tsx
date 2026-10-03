import { useJoinUrl } from '../hooks/useJoinUrl';
import { usePlaybackState } from '../hooks/usePlaybackState';
import { usePlaybackSync } from '../hooks/usePlaybackSync';
import { useQueue } from '../hooks/useQueue';
import { useScreenPositionReporter } from '../hooks/useScreenPositionReporter';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { reportSongEnded } from '../services/playbackCommands';
import { JoinQrCode } from './JoinQrCode';
import { NextSingerCard } from './NextSingerCard';
import { QueueList } from './QueueList';

const VISIBLE_UPCOMING = 5;

export function KaraokeScreen() {
    const joinUrl = useJoinUrl();
    const playbackState = usePlaybackState();
    const queue = useQueue();
    const { containerRef, player } = useYouTubePlayer({ muted: false, onEnded: reportSongEnded });

    usePlaybackSync(player, playbackState);
    useScreenPositionReporter(player);

    const hasVideo = playbackState?.videoId != null;
    const current = queue?.current ?? null;
    const [nextEntry, ...laterEntries] = queue?.upcoming ?? [];

    return (
        <main className="screen-page">
            <div ref={containerRef} className="video-frame" />

            {hasVideo && current !== null && (
                <p className="now-singing">
                    <span className="now-singing-label">A cantar</span>
                    {current.singerName}
                    <span className="now-singing-song">{current.title}</span>
                </p>
            )}

            {!hasVideo && (
                <div className="screen-idle">
                    <div className="screen-stage">
                        {nextEntry !== undefined
                            ? <NextSingerCard entry={nextEntry} />
                            : (
                                <section className="screen-welcome">
                                    <h1>Quem canta primeiro?</h1>
                                    <p>Aponta a câmara do telemóvel ao código para escolher uma música.</p>
                                </section>
                            )}
                    </div>

                    <aside className="screen-join">
                        <p className="screen-join-title">Entrar na fila</p>
                        {joinUrl !== null
                            ? <JoinQrCode url={joinUrl} size={nextEntry !== undefined ? 180 : 260} />
                            : <p>A procurar a rede local...</p>}
                    </aside>

                    {laterEntries.length > 0 && (
                        <section className="screen-upcoming">
                            <h2>A seguir</h2>
                            <QueueList
                                entries={laterEntries.slice(0, VISIBLE_UPCOMING)}
                                firstPosition={2}
                                variant="strip"
                            />
                        </section>
                    )}
                </div>
            )}
        </main>
    );
}
