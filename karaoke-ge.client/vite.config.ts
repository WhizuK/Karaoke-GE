import { fileURLToPath, URL } from 'node:url';
import { env } from 'node:process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const serverUrl = env.ASPNETCORE_URLS?.split(';')[0] ?? 'http://localhost:5240';

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
            '^/api': { target: serverUrl },
            '^/hubs': { target: serverUrl, ws: true },
        },
    },
});
