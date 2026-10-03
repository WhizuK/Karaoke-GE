import { useState } from 'react';
import { useLibrary } from '../hooks/useLibrary';
import { ChurchSongs } from './ChurchSongs';
import { SongSearch } from './SongSearch';
import { VideoLinkForm } from './VideoLinkForm';

type SongSource = 'church' | 'youtube';

type SongPickerProps = {
    onAddVideo: (videoId: string) => Promise<void>;
};

export function SongPicker({ onAddVideo }: SongPickerProps) {
    const library = useLibrary();
    const [chosenSource, setChosenSource] = useState<SongSource | null>(null);

    // Se ainda ninguém escolheu, começamos pelas músicas da igreja (não gasta quota do YouTube).
    const source: SongSource = chosenSource ?? (library.length > 0 ? 'church' : 'youtube');

    return (
        <section className="song-picker">
            <div className="source-switch" role="group" aria-label="Onde procurar a música">
                <button
                    type="button"
                    aria-pressed={source === 'church'}
                    onClick={() => setChosenSource('church')}
                >
                    Músicas da igreja
                </button>
                <button
                    type="button"
                    aria-pressed={source === 'youtube'}
                    onClick={() => setChosenSource('youtube')}
                >
                    Pesquisar no YouTube
                </button>
            </div>

            {source === 'church'
                ? <ChurchSongs songs={library} onAddVideo={onAddVideo} />
                : (
                    <>
                        <SongSearch onAddVideo={onAddVideo} />
                        <details className="paste-link">
                            <summary>Já tens o link? Cola-o aqui</summary>
                            <VideoLinkForm onSubmitVideo={onAddVideo} />
                        </details>
                    </>
                )}
        </section>
    );
}
