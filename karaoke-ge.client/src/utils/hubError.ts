const HUB_EXCEPTION_MARKER = 'HubException: ';
const FALLBACK_MESSAGE = 'Ocorreu um erro. Tenta outra vez.';

export function getUserMessage(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);
    const markerIndex = message.indexOf(HUB_EXCEPTION_MARKER);

    return markerIndex >= 0
        ? message.slice(markerIndex + HUB_EXCEPTION_MARKER.length)
        : FALLBACK_MESSAGE;
}
