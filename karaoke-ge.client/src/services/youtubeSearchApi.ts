import type { YouTubeSearchResult } from '../types/youtubeSearch';

const FALLBACK_MESSAGE = 'Não foi possível pesquisar. Tenta outra vez.';

type ProblemDetails = {
    detail?: string;
};

export async function searchYouTube(query: string, onlyKaraoke: boolean): Promise<YouTubeSearchResult[]> {
    const params = new URLSearchParams({ q: query, karaoke: String(onlyKaraoke) });
    const response = await fetch(`/api/youtube/search?${params}`);

    if (!response.ok) {
        throw new Error(await readProblemMessage(response));
    }

    return response.json();
}

// O servidor responde aos erros no formato padrão "Problem Details" ({ detail: "..." }).
async function readProblemMessage(response: Response): Promise<string> {
    try {
        const problem: ProblemDetails = await response.json();
        return problem.detail ?? FALLBACK_MESSAGE;
    } catch {
        return FALLBACK_MESSAGE;
    }
}
