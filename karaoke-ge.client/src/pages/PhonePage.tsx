import { JoinForm } from '../components/JoinForm';
import { SingerView } from '../components/SingerView';
import { useSingerIdentity } from '../hooks/useSingerIdentity';

export function PhonePage() {
    const { identity, saveName, clearName } = useSingerIdentity();

    return (
        <main className="phone-page">
            {identity === null
                ? (
                    <>
                        <header className="phone-welcome">
                            <h1>Karaoke GE</h1>
                            <p>Escreve o teu nome para entrares na fila.</p>
                        </header>
                        <JoinForm onJoin={saveName} />
                    </>
                )
                : <SingerView identity={identity} onChangeName={clearName} />}
        </main>
    );
}
