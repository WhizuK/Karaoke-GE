import { useEffect, useState } from 'react';
import { fetchLocalIpAddress } from '../services/networkApi';

export function useJoinUrl(): string | null {
    const [joinUrl, setJoinUrl] = useState<string | null>(null);

    useEffect(() => {
        fetchLocalIpAddress()
            .then(ipAddress => setJoinUrl(buildJoinUrl(ipAddress)))
            .catch(error => console.error(error));
    }, []);

    return joinUrl;
}

function buildJoinUrl(ipAddress: string): string {
    const { protocol, port } = window.location;
    const portSuffix = port ? `:${port}` : '';
    return `${protocol}//${ipAddress}${portSuffix}/`;
}