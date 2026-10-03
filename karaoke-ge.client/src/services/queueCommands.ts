import type { QueueSnapshot } from '../types/queue';
import { invokeHub } from './karaokeConnection';

export function fetchQueue(): Promise<QueueSnapshot> {
    return invokeHub<QueueSnapshot>('GetQueue');
}

export function addToQueue(videoId: string): Promise<void> {
    return invokeHub('AddToQueue', videoId);
}

export function removeFromQueue(entryId: string): Promise<void> {
    return invokeHub('RemoveFromQueue', entryId);
}

export function moveUpInQueue(entryId: string): Promise<void> {
    return invokeHub('MoveUpInQueue', entryId);
}

export function moveDownInQueue(entryId: string): Promise<void> {
    return invokeHub('MoveDownInQueue', entryId);
}

export function startNextSong(): Promise<void> {
    return invokeHub('StartNextSong');
}
