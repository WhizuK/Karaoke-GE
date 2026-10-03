import { fileURLToPath, URL } from 'node:url';
import { env } from 'node:process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Deve coincidir com a porta do launchSettings.json do servidor.
const SERVER_URL = 'http://localhost:5240';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        host: true,
        port: Number(env.DEV_SERVER_PORT || 53066),
        proxy: {
            // O SignalR (/hubs) liga diretamente ao servidor: ver services/karaokeConnection.ts
            '^/api': { target: SERVER_URL },
        },
    },
});
