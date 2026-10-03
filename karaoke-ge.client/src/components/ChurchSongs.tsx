import { useState } from 'react';
import type { LibrarySong } from '../types/library';
import { getUserMessage } from '../utils/hubError';
import { normalizeForSearch } from '../utils/text';
import { youTubeThumbnailUrl } from '../utils/youtubeThumbnail';

type ChurchSongsProps = {
    songs: LibrarySong[];
    onAddVideo?: (videoId: string) => Promise<void>;
    onRemove?: (videoId: string) => void;
};

export function ChurchSongs({ songs, onAddVideo, onRemove }: ChurchSongsProps) {
    const [filter, setFilter] = useState('');
    const [addingVideoId, setAddingVideoId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (songs.length === 0) {
        return <p className="muted-text">Ainda não há músicas aqui. As músicas cantadas ficam guardadas nesta lista.</p>;
    }

    const normalizedFilter = normalizeForSearch(filter.trim());
    const visibleSongs = songs.filter(song => normalizeForSearch(song.title).includes(normalizedFilter));

    async function add(videoId: string) {
        if (onAddVideo === undefined) {
            return;
        }

        setError(null);
        setAddingVideoId(videoId);
        try {
            await onAddVideo(videoId);
        } catch (addError) {
            setError(getUserMessage(addError));
        } finally {
            setAddingVideoId(null);
        }
    }

    return (
        <section className="church-songs">
            <div className="stack-form">
                <label htmlFor="church-songs-filter">Procurar nas músicas da igreja</label>
                <input
                    id="church-songs-filter"
                    type="search"
                    value={filter}
                    onChange={event => setFilter(event.target.value)}
                />
            </div>

            {error !== null && (
                <p className="form-error" role="alert">
                    {error}
                </p>
            )}

            {visibleSongs.length === 0
                ? <p className="muted-text">Nenhuma música com esse nome.</p>
                : (
                    <ul className="search-results">
                        {visibleSongs.map(song => (
                            <li key={song.videoId} className="search-result">
                                <img src={youTubeThumbnailUrl(song.videoId)} alt="" loading="lazy" />
                                <span className="search-result-text">
                                    <span className="search-result-title">{song.title}</span>
                                    <span className="muted-text">{describeTimesSung(song.timesSung)}</span>
                                </span>
                                {onAddVideo && (
                                    <button
                                        type="button"
                                        className="button-primary"
                                        disabled={addingVideoId !== null}
                                        onClick={() => void add(song.videoId)}
                                    >
                                        {addingVideoId === song.videoId ? 'A adicionar...' : 'Adicionar'}
                                    </button>
                                )}
                                {onRemove && (
                                    <button
                                        type="button"
                                        className="icon-button is-danger"
                                        aria-label={`Remover ${song.title} das músicas da igreja`}
                                        onClick={() => onRemove(song.videoId)}
                                    >
                                        ✕
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
        </section>
    );
}

function describeTimesSung(timesSung: number): string {
    return timesSung === 1 ? 'Cantada 1 vez' : `Cantada ${timesSung} vezes`;
}
