import { useState } from 'react';
import { searchYouTube } from '../services/youtubeSearchApi';
import type { YouTubeSearchResult } from '../types/youtubeSearch';
import { getUserMessage } from '../utils/hubError';
import { youTubeThumbnailUrl } from '../utils/youtubeThumbnail';

const MIN_QUERY_LENGTH = 2;

type SongSearchProps = {
    onAddVideo: (videoId: string) => Promise<void>;
};

type SearchStatus = 'idle' | 'searching' | 'done';

export function SongSearch({ onAddVideo }: SongSearchProps) {
    const [query, setQuery] = useState('');
    const [onlyKaraoke, setOnlyKaraoke] = useState(false);
    const [status, setStatus] = useState<SearchStatus>('idle');
    const [results, setResults] = useState<YouTubeSearchResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [addingVideoId, setAddingVideoId] = useState<string | null>(null);

    const canSearch = query.trim().length >= MIN_QUERY_LENGTH && status !== 'searching';

    async function search() {
        setError(null);
        setStatus('searching');
        try {
            setResults(await searchYouTube(query.trim(), onlyKaraoke));
        } catch (searchError) {
            setResults([]);
            setError(searchError instanceof Error ? searchError.message : String(searchError));
        } finally {
            setStatus('done');
        }
    }

    async function add(videoId: string) {
        setError(null);
        setAddingVideoId(videoId);
        try {
            await onAddVideo(videoId);
            setResults([]);
            setQuery('');
            setStatus('idle');
        } catch (addError) {
            setError(getUserMessage(addError));
        } finally {
            setAddingVideoId(null);
        }
    }

    return (
        <section className="song-search">
            <form
                className="stack-form"
                onSubmit={event => {
                    event.preventDefault();
                    if (canSearch) {
                        void search();
                    }
                }}
            >
                <label htmlFor="song-query">Procurar música</label>
                <div className="search-row">
                    <input
                        id="song-query"
                        type="search"
                        enterKeyHint="search"
                        placeholder="Ex.: Grande é o Senhor"
                        value={query}
                        onChange={event => setQuery(event.target.value)}
                    />
                    <button type="submit" className="button-primary" disabled={!canSearch}>
                        {status === 'searching' ? 'A pesquisar...' : 'Pesquisar'}
                    </button>
                </div>
                <label className="check-label">
                    <input
                        type="checkbox"
                        checked={onlyKaraoke}
                        onChange={event => setOnlyKaraoke(event.target.checked)}
                    />
                    Só versões karaoke
                </label>
            </form>

            {error !== null && (
                <p className="form-error" role="alert">
                    {error}
                </p>
            )}

            {status === 'done' && error === null && results.length === 0 && (
                <p className="muted-text">Nenhum resultado. Experimenta outras palavras.</p>
            )}

            {results.length > 0 && (
                <ul className="search-results">
                    {results.map(result => (
                        <li key={result.videoId} className="search-result">
                            <img src={youTubeThumbnailUrl(result.videoId)} alt="" loading="lazy" />
                            <span className="search-result-text">
                                <span className="search-result-title">{result.title}</span>
                                <span className="muted-text">{result.channelTitle}</span>
                            </span>
                            <button
                                type="button"
                                className="button-primary"
                                disabled={addingVideoId !== null}
                                onClick={() => void add(result.videoId)}
                            >
                                {addingVideoId === result.videoId ? 'A adicionar...' : 'Adicionar'}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
