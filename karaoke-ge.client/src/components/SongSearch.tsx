import { useState } from 'react';
import { searchYouTube } from '../services/youtubeSearchApi';
import type { YouTubeSearchResult } from '../types/youtubeSearch';
import { getUserMessage } from '../utils/hubError';
import { youTubeThumbnailUrl } from '../utils/youtubeThumbnail';

const MIN_QUERY_LENGTH = 2;

type SongSearchProps = {
    onAddVideo: (videoId: string) => Promise<void>;
};

type SearchStatus = 'idle' | 'searching' | 'loading-more' | 'done';

// A pesquisa que está a ser mostrada. Guardamo-la à parte do campo de texto,
// para "Carregar mais" continuar a mesma pesquisa mesmo que a pessoa já tenha mudado o texto.
type ActiveSearch = {
    query: string;
    onlyKaraoke: boolean;
    nextPageToken: string | null;
};

export function SongSearch({ onAddVideo }: SongSearchProps) {
    const [query, setQuery] = useState('');
    const [onlyKaraoke, setOnlyKaraoke] = useState(false);
    const [status, setStatus] = useState<SearchStatus>('idle');
    const [results, setResults] = useState<YouTubeSearchResult[]>([]);
    const [activeSearch, setActiveSearch] = useState<ActiveSearch | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [addingVideoId, setAddingVideoId] = useState<string | null>(null);

    const isBusy = status === 'searching' || status === 'loading-more';
    const canSearch = query.trim().length >= MIN_QUERY_LENGTH && !isBusy;
    const canLoadMore = activeSearch?.nextPageToken != null && !isBusy;

    async function search() {
        const newSearch = { query: query.trim(), onlyKaraoke };

        setError(null);
        setStatus('searching');
        try {
            const page = await searchYouTube(newSearch.query, newSearch.onlyKaraoke);
            setResults(page.results);
            setActiveSearch({ ...newSearch, nextPageToken: page.nextPageToken });
        } catch (searchError) {
            setResults([]);
            setActiveSearch(null);
            setError(errorMessage(searchError));
        } finally {
            setStatus('done');
        }
    }

    async function loadMore() {
        if (activeSearch === null || activeSearch.nextPageToken === null) {
            return;
        }

        setError(null);
        setStatus('loading-more');
        try {
            const page = await searchYouTube(activeSearch.query, activeSearch.onlyKaraoke, activeSearch.nextPageToken);
            setResults(current => appendWithoutDuplicates(current, page.results));
            setActiveSearch({ ...activeSearch, nextPageToken: page.nextPageToken });
        } catch (loadError) {
            setError(errorMessage(loadError));
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
            setActiveSearch(null);
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

            {results.length > 0 && activeSearch?.nextPageToken != null && (
                <button type="button" disabled={!canLoadMore} onClick={() => void loadMore()}>
                    {status === 'loading-more' ? 'A carregar...' : 'Carregar mais resultados'}
                </button>
            )}
        </section>
    );
}

// O YouTube às vezes repete um vídeo entre páginas: não o mostramos duas vezes.
function appendWithoutDuplicates(
    current: YouTubeSearchResult[],
    more: YouTubeSearchResult[],
): YouTubeSearchResult[] {
    const knownIds = new Set(current.map(result => result.videoId));
    return [...current, ...more.filter(result => !knownIds.has(result.videoId))];
}

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
