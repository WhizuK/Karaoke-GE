type NetworkAddressResponse = {
    ipAddress: string;
};

export async function fetchLocalIpAddress(): Promise<string> {
    const response = await fetch('/api/network/address');

    if (!response.ok) {
        throw new Error('Não foi possível obter o endereço da rede local.');
    }

    const data: NetworkAddressResponse = await response.json();
    return data.ipAddress;
}
