import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';

export const karaokeConnection = new HubConnectionBuilder()
    .withUrl('/hubs/karaoke')
    .withAutomaticReconnect()
    .build();

let startPromise: Promise<void> | null = null;

export function ensureConnectionStarted(): Promise<void> {
    if (karaokeConnection.state === HubConnectionState.Disconnected) {
        startPromise = karaokeConnection.start();
    }

    return startPromise ?? Promise.resolve();
}

export async function invokeHub<TResult = void>(methodName: string, ...args: unknown[]): Promise<TResult> {
    await ensureConnectionStarted();
    return karaokeConnection.invoke<TResult>(methodName, ...args);
}
