import { HubConnectionBuilder } from '@microsoft/signalr';

export const karaokeConnection = new HubConnectionBuilder()
    .withUrl('/hubs/karaoke')
    .withAutomaticReconnect()
    .build();

