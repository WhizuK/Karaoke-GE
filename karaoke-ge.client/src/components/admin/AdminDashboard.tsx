import { useState } from 'react';
import { useConnectedDevices } from '../../hooks/useConnectedDevices';
import { usePlaybackState } from '../../hooks/usePlaybackState';
import { useQueue } from '../../hooks/useQueue';
import { useSingers } from '../../hooks/useSingers';
import { setLeader } from '../../services/adminCommands';
import { moveDownInQueue, moveUpInQueue, removeFromQueue } from '../../services/queueCommands';
import { getUserMessage } from '../../utils/hubError';
import { QueueList } from '../QueueList';
import { AdminNowPlaying } from './AdminNowPlaying';
import { AdminSingerList } from './AdminSingerList';

type AdminDashboardProps = {
    onLogout: () => void;
};

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
    const queue = useQueue();
    const playbackState = usePlaybackState();
    const singers = useSingers();
    const connectedDevices = useConnectedDevices();
    const [actionError, setActionError] = useState<string | null>(null);

    const upcoming = queue?.upcoming ?? [];

    function runAction(action: () => Promise<void>) {
        setActionError(null);
        action().catch(error => setActionError(getUserMessage(error)));
    }

    return (
        <>
            <header className="admin-header">
                <h1>Admin</h1>
                <p className="muted-text">{connectedDevices} aparelhos ligados</p>
                <button type="button" className="link-button" onClick={onLogout}>
                    Sair
                </button>
            </header>

            {actionError !== null && (
                <p className="form-error" role="alert">
                    {actionError}
                </p>
            )}

            <div className="admin-columns">
                <section className="admin-panel">
                    <h2>A tocar agora</h2>
                    <AdminNowPlaying
                        current={queue?.current ?? null}
                        next={upcoming[0]}
                        playbackState={playbackState}
                        onAction={runAction}
                    />
                </section>

                <section className="admin-panel">
                    <h2>Fila</h2>
                    <QueueList
                        entries={upcoming}
                        isAdmin
                        onMoveUp={entryId => runAction(() => moveUpInQueue(entryId))}
                        onMoveDown={entryId => runAction(() => moveDownInQueue(entryId))}
                        onRemove={entryId => runAction(() => removeFromQueue(entryId))}
                    />
                </section>

                <section className="admin-panel">
                    <h2>Pessoas</h2>
                    <AdminSingerList
                        singers={singers}
                        onToggleLeader={(singerId, isLeader) => runAction(() => setLeader(singerId, isLeader))}
                    />
                </section>
            </div>
        </>
    );
}
