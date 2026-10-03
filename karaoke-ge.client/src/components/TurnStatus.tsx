type TurnStatusProps = {
    isSinging: boolean;
    isMyTurn: boolean;
    currentSingerName: string | null;
    myPosition: number | null;
    onStart: () => void;
};

export function TurnStatus({ isSinging, isMyTurn, currentSingerName, myPosition, onStart }: TurnStatusProps) {
    if (isMyTurn) {
        return (
            <section className="turn-pane is-my-turn" aria-live="polite">
                <h2>É a tua vez</h2>
                <button type="button" className="button-gold" onClick={onStart}>
                    Começar
                </button>
            </section>
        );
    }

    if (isSinging) {
        return (
            <section className="turn-pane is-singing" aria-live="polite">
                <h2>Estás a cantar</h2>
                <p>Abre a letra em ecrã inteiro para ler melhor.</p>
            </section>
        );
    }

    return (
        <section className="turn-pane">
            <p>{currentSingerName !== null ? `A cantar agora: ${currentSingerName}` : 'Ninguém está a cantar.'}</p>
            {myPosition !== null && <p className="muted-text">Estás em {myPosition}.º lugar na fila.</p>}
        </section>
    );
}
