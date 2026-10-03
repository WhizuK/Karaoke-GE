import type { Singer } from '../types/singer';
import { invokeHub, onReconnected } from './karaokeConnection';

let adminPin: string | null = null;

// Uma ligação nova (depois de uma falha de rede) já não está autenticada:
// voltamos a entrar com o mesmo PIN.
onReconnected(() => {
    if (adminPin !== null) {
        invokeHub('LoginAsAdmin', adminPin).catch(error =>
            console.error('Falha ao voltar a entrar como admin', error),
        );
    }
});

export async function loginAsAdmin(pin: string): Promise<void> {
    await invokeHub('LoginAsAdmin', pin);
    adminPin = pin;
}

export function fetchSingers(): Promise<Singer[]> {
    return invokeHub<Singer[]>('GetSingers');
}

export function setLeader(singerId: string, isLeader: boolean): Promise<void> {
    return invokeHub('SetLeader', singerId, isLeader);
}

export function setVolume(volume: number): Promise<void> {
    return invokeHub('SetVolume', volume);
}
