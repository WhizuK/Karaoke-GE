/** Para pesquisar sem ligar a maiúsculas nem acentos: "Coração" encontra "coracao". */
export function normalizeForSearch(text: string): string {
    return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}
