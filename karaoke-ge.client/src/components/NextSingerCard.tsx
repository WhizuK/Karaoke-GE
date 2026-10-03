import type { QueueEntry } from '../types/queue';
import { youTubeThumbnailUrl } from '../utils/youtubeThumbnail';

type NextSingerCardProps = {
    entry: QueueEntry;
};

export function NextSingerCard({ entry }: NextSingerCardProps) {
    return (
        <section className="next-singer">
            <div className="arched-window">
                <img src={youTubeThumbnailUrl(entry.videoId)} alt="" />
            </div>
            <div className="next-singer-text">
                <p className="next-singer-label">Próximo a cantar</p>
                <h1 className="next-singer-name">{entry.singerName}</h1>
                {entry.isLeader && <p className="leader-badge is-large">Líder</p>}
                <p className="next-singer-hint">Toca em «Começar» no teu telemóvel.</p>
            </div>
        </section>
    );
}
