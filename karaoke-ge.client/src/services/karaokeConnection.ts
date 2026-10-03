import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';

const RETRY_DELAYS_MS = [0, 1000, 2000, 5000];
const MAX_RETRY_DELAY_MS = 5000;

// Em desenvolvimento ligamos diretamente ao servidor .NET (porta 5240), sem passar
// pelo proxy do Vite, que perdia as mensagens do WebSocket. Na versão final o .NET
// serve tudo na mesma porta, por isso basta o caminho relativo.
const DEV_SERVER_PORT = 5240;
const HUB_PATH = '/hubs/karaoke';

const hubUrl = import.meta.env.DEV
    ? `${window.location.protocol}//${window.location.hostname}:${DEV_SERVER_PORT}${HUB_PATH}`
    : HUB_PATH;

export const karaokeConnection = new HubConnectionBuilder()
    .withUrl(hubUrl, { withCredentials: false })
    .withAutomaticReconnect({
        // Nunca desiste: numa igreja o Wi-Fi pode falhar durante minutos.
        nextRetryDelayInMilliseconds: ({ previousRetryCount }) => retryDelay(previousRetryCount),
    })
    .build();

const reconnectedListeners = new Set<() => void>();

karaokeConnection.onreconnected(() => {
    reconnectedListeners.forEach(listener => listener());
});

/** Regista uma função a chamar sempre que a ligação volta. Devolve a função para cancelar. */
export function onReconnected(listener: () => void): () => void {
    reconnectedListeners.add(listener);
    return () => reconnectedListeners.delete(listener);
}

let startPromise: Promise<void> | null = null;

export function ensureConnectionStarted(): Promise<void> {
    if (karaokeConnection.state === HubConnectionState.Connected) {
        return Promise.resolve();
    }

    startPromise ??= startWithRetry().finally(() => {
        startPromise = null;
    });

    return startPromise;
}

export async function invokeHub<TResult = void>(methodName: string, ...args: unknown[]): Promise<TResult> {
    await ensureConnectionStarted();
    return karaokeConnection.invoke<TResult>(methodName, ...args);
}

// O servidor pode ainda não estar pronto (o Vite arranca mais depressa que o .NET)
// ou estar a reiniciar. Em vez de falhar, tentamos outra vez até conseguir.
async function startWithRetry(): Promise<void> {
    for (let attempt = 0; ; attempt++) {
        if (karaokeConnection.state === HubConnectionState.Connected) {
            return;
        }

        if (karaokeConnection.state === HubConnectionState.Disconnected) {
            try {
                await karaokeConnection.start();
                return;
            } catch (error) {
                console.warn('Ligação ao servidor falhou. A tentar outra vez...', error);
            }
        }

        await wait(retryDelay(attempt));
    }
}

function retryDelay(attempt: number): number {
    return RETRY_DELAYS_MS[attempt] ?? MAX_RETRY_DELAY_MS;
}

function wait(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
