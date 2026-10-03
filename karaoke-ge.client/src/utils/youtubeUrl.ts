const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const PATH_VIDEO_ID_PATTERN = /^\/(?:shorts|embed|live)\/([^/?]+)/;

export function parseYouTubeVideoId(input: string): string | null {
    const text = input.trim();

    if (VIDEO_ID_PATTERN.test(text)) {
        return text;
    }

    const url = tryParseUrl(text);
    if (url === null) {
        return null;
    }

    const candidate = extractCandidate(url);
    return candidate !== null && VIDEO_ID_PATTERN.test(candidate) ? candidate : null;
}

function tryParseUrl(text: string): URL | null {
    try {
        return new URL(text);
    } catch {
        return null;
    }
}

function extractCandidate(url: URL): string | null {
    const host = url.hostname.replace(/^(www|m|music)\./, '');

    if (host === 'youtu.be') {
        return url.pathname.split('/')[1] ?? null;
    }

    if (host === 'youtube.com') {
        return url.searchParams.get('v') ?? url.pathname.match(PATH_VIDEO_ID_PATTERN)?.[1] ?? null;
    }

    return null;
}
