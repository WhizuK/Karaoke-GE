import type { PlaybackState } from '../types/playback';
import { invokeHub } from './karaokeConnection';

export function fetchPlaybackState(): Promise<PlaybackState> {
    return invokeHub<PlaybackState>('GetPlaybackState');
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

/** Avança (positivo) ou recua (negativo). O servidor calcula a partir da posição real do PC. */
export function seekBy(deltaSeconds: number) {
    send('SeekBy', deltaSeconds);
}

export function reportPosition(positionSeconds: number) {
    send('ReportPosition', positionSeconds);
}

export function reportSongEnded() {
    send('ReportSongEnded');
}

function send(methodName: string, ...args: unknown[]) {
    invokeHub(methodName, ...args).catch(error =>
        console.error(`Falha ao executar "${methodName}"`, error),
    );
}
