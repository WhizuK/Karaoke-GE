import type { PlaybackState } from '../types/playback';
import { invokeHub } from './karaokeConnection';

export function fetchPlaybackState(): Promise<PlaybackState> {
    return invokeHub<PlaybackState>('GetPlaybackState');
}

export function loadVideo(videoId: string) {
    send('LoadVideo', videoId);
}

export function play() {
    send('Play');
}

export function pause() {
    send('Pause');
}

export function stop() {
    send('Stop');
}

export function seekTo(positionSeconds: number) {
    send('SeekTo', Math.max(0, positionSeconds));
}

export function reportPosition(positionSeconds: number) {
    send('ReportPosition', positionSeconds);
}

function send(methodName: string, ...args: unknown[]) {
    invokeHub(methodName, ...args).catch(error =>
        console.error(`Falha ao executar "${methodName}"`, error),
    );
}
