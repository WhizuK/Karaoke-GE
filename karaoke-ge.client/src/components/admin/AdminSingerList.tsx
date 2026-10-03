import type { Singer } from '../../types/singer';

type AdminSingerListProps = {
    singers: Singer[];
    onToggleLeader: (singerId: string, isLeader: boolean) => void;
};

export function AdminSingerList({ singers, onToggleLeader }: AdminSingerListProps) {
    if (singers.length === 0) {
        return <p className="muted-text">Ninguém entrou ainda. Mostra o código do ecrã às pessoas.</p>;
    }

    return (
        <ul className="singer-list">
            {singers.map(singer => (
                <li key={singer.id} className="singer-row">
                    <span>{singer.name}</span>
                    <label className="leader-toggle">
                        <input
                            type="checkbox"
                            checked={singer.isLeader}
                            onChange={event => onToggleLeader(singer.id, event.target.checked)}
                        />
                        Líder
                    </label>
                </li>
            ))}
        </ul>
    );
}
