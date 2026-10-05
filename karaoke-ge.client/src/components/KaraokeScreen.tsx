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

const VISIBLE_UPCOMING = 4;
const QR_CODE_SIZE = 200;

/**
 * Ecrã do PC: o vídeo à esquerda e uma coluna fixa à direita com o QR code.
 * O QR code fica sempre visível, para alguém poder entrar na fila a meio de uma música.
 */
export function KaraokeScreen() {
    const joinUrl = useJoinUrl();
    const playbackState = usePlaybackState();
    const queue = useQueue();
    const { containerRef, player } = useYouTubePlayer({ muted: false, onEnded: reportSongEnded });

    usePlaybackSync(player, playbackState);
    useScreenPositionReporter(player);

    const hasVideo = playbackState?.videoId != null;
    const current = queue?.current ?? null;
    const upcoming = queue?.upcoming ?? [];
    const [nextEntry] = upcoming;

    // Enquanto nada toca, o próximo cantor aparece em grande no palco, por isso a lista começa no 2.º.
    const listedEntries = hasVideo ? upcoming : upcoming.slice(1);
    const firstListedPosition = hasVideo ? 1 : 2;

    return (
        <main className="screen-page">
            <div className="screen-stage">
                {/* O leitor está sempre montado: tirá-lo do ecrã obrigava a recriar o vídeo. */}
                <div ref={containerRef} className="video-frame" />

                {!hasVideo && (
                    <div className="screen-idle">
                        {nextEntry !== undefined
                            ? <NextSingerCard entry={nextEntry} />
                            : (
                                <section className="screen-welcome">
                                    <h1>Quem canta primeiro?</h1>
                                    <p>Aponta a câmara do telemóvel ao código para escolher uma música.</p>
                                </section>
                            )}
                    </div>
                )}
            </div>

            <aside className="screen-sidebar">
                {hasVideo && current !== null && (
                    <section className="now-singing">
                        <span className="now-singing-label">A cantar</span>
                        <span className="now-singing-name">{current.singerName}</span>
                        <span className="now-singing-song">{current.title}</span>
                    </section>
                )}

                <section className="screen-join">
                    <p className="screen-join-title">Entrar na fila</p>
                    {joinUrl !== null
                        ? <JoinQrCode url={joinUrl} size={QR_CODE_SIZE} />
                        : <p>A procurar a rede local...</p>}
                </section>

                {listedEntries.length > 0 && (
                    <section className="screen-upcoming">
                        <h2>A seguir</h2>
                        <QueueList
                            entries={listedEntries.slice(0, VISIBLE_UPCOMING)}
                            firstPosition={firstListedPosition}
                        />
                        {listedEntries.length > VISIBLE_UPCOMING && (
                            <p className="muted-text">e mais {listedEntries.length - VISIBLE_UPCOMING}...</p>
                        )}
                    </section>
                )}
            </aside>
        </main>
    );
}
