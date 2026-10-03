// O localStorage pode lançar erros (modo privado, armazenamento bloqueado).
// Nesses casos a app continua a funcionar; os dados só não ficam guardados.

export function readStoredItem(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

export function writeStoredItem(key: string, value: string | null) {
    try {
        if (value === null) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, value);
        }
    } catch {
        // Ver comentário no topo do ficheiro.
    }
}
