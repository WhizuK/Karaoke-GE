import type { QueueEntry } from '../types/queue';
import { youTubeThumbnailUrl } from '../utils/youtubeThumbnail';

type QueueListProps = {
    entries: QueueEntry[];
    firstPosition?: number;
    variant?: 'list' | 'strip';
    mySingerId?: string;
    isAdmin?: boolean;
    onMoveUp?: (entryId: string) => void;
    onMoveDown?: (entryId: string) => void;
    onRemove?: (entryId: string) => void;
};

export function QueueList({
    entries,
    firstPosition = 1,
    variant = 'list',
    mySingerId,
    isAdmin = false,
    onMoveUp,
    onMoveDown,
    onRemove,
}: QueueListProps) {
    if (entries.length === 0) {
        return <p className="muted-text">Ainda não há músicas na fila.</p>;
    }

    function canMove(index: number, offset: number): boolean {
        const neighbour = entries[index + offset];
        if (neighbour === undefined) {
            return false;
        }
        return isAdmin || neighbour.singerId === entries[index].singerId;
    }

    return (
        <ol className={`queue-list queue-list--${variant}`}>
            {entries.map((entry, index) => {
                const isMine = entry.singerId === mySingerId;
                const canEdit = isAdmin || isMine;
                const paneClassName = [
                    'queue-pane',
                    entry.isLeader ? 'is-leader' : '',
                    isMine ? 'is-mine' : '',
                ].filter(Boolean).join(' ');

                return (
                    <li key={entry.id} className={paneClassName}>
                        <span className="queue-position">{firstPosition + index}</span>
                        <img
                            className="queue-thumbnail"
                            src={youTubeThumbnailUrl(entry.videoId)}
                            alt=""
                            loading="lazy"
                        />
                        <span className="queue-singer">
                            <span className="queue-singer-name">{entry.singerName}</span>
                            <span className="queue-song-title">{entry.title}</span>
                            {(entry.isLeader || isMine) && (
                                <span className="queue-badges">
                                    {entry.isLeader && <span className="leader-badge">Líder</span>}
                                    {isMine && <span className="mine-badge">a tua música</span>}
                                </span>
                            )}
                        </span>
                        {canEdit && (onMoveUp || onMoveDown || onRemove) && (
                            <span className="queue-actions">
                                {onMoveUp && canMove(index, -1) && (
                                    <button
                                        type="button"
                                        className="icon-button"
                                        aria-label={`Subir a música de ${entry.singerName}`}
                                        onClick={() => onMoveUp(entry.id)}
                                    >
                                        ↑
                                    </button>
                                )}
                                {onMoveDown && canMove(index, 1) && (
                                    <button
                                        type="button"
                                        className="icon-button"
                                        aria-label={`Descer a música de ${entry.singerName}`}
                                        onClick={() => onMoveDown(entry.id)}
                                    >
                                        ↓
                                    </button>
                                )}
                                {onRemove && (
                                    <button
                                        type="button"
                                        className="icon-button is-danger"
                                        aria-label={`Remover a música de ${entry.singerName}`}
                                        onClick={() => onRemove(entry.id)}
                                    >
                                        ✕
                                    </button>
                                )}
                            </span>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
