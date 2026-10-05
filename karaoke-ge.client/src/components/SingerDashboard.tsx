import { useState } from 'react';
import { useFullscreen } from '../hooks/useFullscreen';
import { useMirrorPositionSync } from '../hooks/useMirrorPositionSync';
import { usePlaybackState } from '../hooks/usePlaybackState';
import { usePlaybackSync } from '../hooks/usePlaybackSync';
import { useQueue } from '../hooks/useQueue';
import { useSingers } from '../hooks/useSingers';
import { useStalledPlayback } from '../hooks/useStalledPlayback';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { pause, play, seekBy, seekTo, stop } from '../services/playbackCommands';
import {
    addToQueue,
    moveDownInQueue,
    moveUpInQueue,
    removeFromQueue,
    startNextSong,
} from '../services/queueCommands';
import type { Singer } from '../types/singer';
import { getUserMessage } from '../utils/hubError';
import { PlaybackControls } from './PlaybackControls';
import { QueueList } from './QueueList';
import { SongPicker } from './SongPicker';
import { TurnStatus } from './TurnStatus';

type SingerDashboardProps = {
    singer: Singer;
    onChangeName: () => void;
};

export function SingerDashboard({ singer, onChangeName }: SingerDashboardProps) {
    const playbackState = usePlaybackState();
    const queue = useQueue();
    const singers = useSingers();
    const { containerRef, player } = useYouTubePlayer({ muted: true });
    const fullscreen = useFullscreen<HTMLDivElement>();
    const [actionError, setActionError] = useState<string | null>(null);

    usePlaybackSync(player, playbackState);
    useMirrorPositionSync(player);

    // O admin pode tornar-nos líder a qualquer momento: a lista de pessoas tem o valor atual.
    const isLeader = singers.find(person => person.id === singer.id)?.isLeader ?? singer.isLeader;

    const current = queue?.current ?? null;
    const upcoming = queue?.upcoming ?? [];
    const myIndex = upcoming.findIndex(entry => entry.singerId === singer.id);

    const isSinging = current?.singerId === singer.id;
    const isMyTurn = current === null && myIndex === 0;
    const canAddSong = isLeader || myIndex === -1;
    const hasVideo = playbackState?.videoId != null;
    const isStalled = useStalledPlayback(player, hasVideo && playbackState?.isPlaying === true);

    function runAction(action: () => Promise<void>) {
        setActionError(null);
        action().catch(error => setActionError(getUserMessage(error)));
    }

    return (
        <>
            <header className="singer-header">
                <h1>
                    {singer.name}
                    {isLeader && <span className="leader-badge">Líder</span>}
                </h1>
                <button type="button" className="link-button" onClick={onChangeName}>
                    Trocar nome
                </button>
            </header>

            <div
                ref={fullscreen.elementRef}
                className={fullscreen.isFullscreen ? 'phone-video is-fullscreen' : 'phone-video'}
            >
                {/* Se o telemóvel bloqueou o vídeo, deixamos tocar nele: um toque dentro do vídeo
                    é o que o iPhone exige para o pôr a andar. Depois a sincronização acerta o tempo. */}
                <div ref={containerRef} className={isStalled ? 'video-frame is-tappable' : 'video-frame'} />
                {!hasVideo && <p className="video-placeholder">Nenhuma música a tocar</p>}
                {isStalled && (
                    <p className="tap-to-play" aria-live="polite">
                        <span>Toca no vídeo para ver a letra</span>
                    </p>
                )}
                {fullscreen.isFullscreen && (
                    <button type="button" className="exit-fullscreen" onClick={fullscreen.exit}>
                        Sair do ecrã inteiro
                    </button>
                )}
            </div>

            {hasVideo && (
                <button type="button" onClick={fullscreen.enter}>
                    Ver a letra em ecrã inteiro
                </button>
            )}

            <TurnStatus
                isSinging={isSinging}
                isMyTurn={isMyTurn}
                currentSingerName={current?.singerName ?? null}
                myPosition={myIndex >= 0 ? myIndex + 1 : null}
                onStart={() => runAction(startNextSong)}
            />

            {isSinging && playbackState !== null && (
                <PlaybackControls
                    isPlaying={playbackState.isPlaying}
                    onPlay={play}
                    onPause={pause}
                    onSeekBy={seekBy}
                    onRestart={() => seekTo(0)}
                    onStop={stop}
                />
            )}

            {actionError !== null && (
                <p className="form-error" role="alert">
                    {actionError}
                </p>
            )}

            {canAddSong
                ? <SongPicker onAddVideo={addToQueue} />
                : <p className="muted-text">Já tens uma música na fila. Podes escolher outra depois de cantares.</p>}

            <section className="queue-section">
                <h2>Fila</h2>
                <QueueList
                    entries={upcoming}
                    mySingerId={singer.id}
                    onMoveUp={entryId => runAction(() => moveUpInQueue(entryId))}
                    onMoveDown={entryId => runAction(() => moveDownInQueue(entryId))}
                    onRemove={entryId => runAction(() => removeFromQueue(entryId))}
                />
            </section>
        </>
    );
}
