import { useEffect, useState } from 'react';
import { HubConnectionState } from '@microsoft/signalr';
import { karaokeConnection } from '../services/karaokeConnection';

export function useConnectedDevices(): number {
    const [total, setTotal] = useState(0);

    useEffect(() => {
        karaokeConnection.on('ConnectedDevicesChanged', setTotal);

        if (karaokeConnection.state === HubConnectionState.Disconnected) {
            karaokeConnection
                .start()
                .catch(error => console.error('Falha ao ligar ao servidor', error));
        }

        return () => karaokeConnection.off('ConnectedDevicesChanged', setTotal);
    }, []);

    return total;

}
