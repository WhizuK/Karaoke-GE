import { useState } from 'react';
import { getUserMessage } from '../utils/hubError';
import { parseYouTubeVideoId } from '../utils/youtubeUrl';

type VideoLinkFormProps = {
    onSubmitVideo: (videoId: string) => Promise<void>;
};

export function VideoLinkForm({ onSubmitVideo }: VideoLinkFormProps) {
    const [link, setLink] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);

    async function submit() {
        const videoId = parseYouTubeVideoId(link);
        if (videoId === null) {
            setError('Isto não parece um link do YouTube.');
            return;
        }

        setError(null);
        setIsSending(true);
        try {
            await onSubmitVideo(videoId);
            setLink('');
        } catch (submitError) {
            setError(getUserMessage(submitError));
        } finally {
            setIsSending(false);
        }
    }

    return (
        <form
            className="stack-form"
            onSubmit={event => {
                event.preventDefault();
                void submit();
            }}
        >
            <label htmlFor="video-link">Adicionar música (link do YouTube)</label>
            <input
                id="video-link"
                inputMode="url"
                placeholder="https://youtu.be/..."
                value={link}
                onChange={event => setLink(event.target.value)}
            />
            <button type="submit" className="button-primary" disabled={link.trim() === '' || isSending}>
                {isSending ? 'A adicionar...' : 'Adicionar à fila'}
            </button>
            {error !== null && (
                <p className="form-error" role="alert">
                    {error}
                </p>
            )}
        </form>
    );
}
