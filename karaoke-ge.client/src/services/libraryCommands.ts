import type { LibrarySong } from '../types/library';
import { invokeHub } from './karaokeConnection';

export function fetchLibrary(): Promise<LibrarySong[]> {
    return invokeHub<LibrarySong[]>('GetLibrary');
}

export function removeFromLibrary(videoId: string): Promise<void> {
    return invokeHub('RemoveFromLibrary', videoId);
}
