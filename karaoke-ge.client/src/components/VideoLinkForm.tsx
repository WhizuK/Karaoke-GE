import { useState } from 'react';
import { parseYouTubeVideoId } from '../utils/youtubeUrl';

type VideoLinkFormProps = {
    onVideoSelected: (videoId: string) => void;
};

export function VideoLinkForm({ onVideoSelected }: VideoLinkFormProps) {
    const [link, setLink] = useState('');
    const [error, setError] = useState<string | null>(null);

    return (
        <form
            className="video-link-form"
            onSubmit={event => {
                event.preventDefault();

                const videoId = parseYouTubeVideoId(link);
                if (videoId === null) {
                    setError('Isto não parece um link do YouTube.');
                    return;
                }

                setError(null);
                setLink('');
                onVideoSelected(videoId);
            }}
        >
            <label htmlFor="video-link">Link do YouTube</label>
            <input
                id="video-link"
                inputMode="url"
                placeholder="https://youtu.be/..."
                value={link}
                onChange={event => setLink(event.target.value)}
            />
            <button type="submit" disabled={link.trim() === ''}>
                Tocar
            </button>
            {error !== null && (
                <p className="form-error" role="alert">
                    {error}
                </p>
            )}
        </form>
    );
}
