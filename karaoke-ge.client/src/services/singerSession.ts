import type { Singer, SingerIdentity } from '../types/singer';
import { invokeHub, onReconnected } from './karaokeConnection';

let registeredIdentity: SingerIdentity | null = null;

// Depois de uma falha de rede o SignalR cria uma ligação nova,
// e o servidor esquece quem somos. Voltamos a apresentar-nos.
onReconnected(() => {
    if (registeredIdentity !== null) {
        sendRegistration(registeredIdentity).catch(error =>
            console.error('Falha ao voltar a registar o cantor', error),
        );
    }
});

export function registerSinger(identity: SingerIdentity): Promise<Singer> {
    registeredIdentity = identity;
    return sendRegistration(identity);
}

function sendRegistration(identity: SingerIdentity): Promise<Singer> {
    return invokeHub<Singer>('Register', identity.id, identity.name);
}
