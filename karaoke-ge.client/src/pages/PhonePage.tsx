import { JoinForm } from '../components/JoinForm';
import { SingerView } from '../components/SingerView';
import { useSingerName } from '../hooks/useSingerName';

export function PhonePage() {
    const { singerName, saveSingerName, clearSingerName } = useSingerName();

    return (
        <main className="phone-page">
            {singerName === null
                ? (
                    <>
                        <h1>Karaoke GE</h1>
                        <JoinForm onJoin={saveSingerName} />
                    </>
                )
                : <SingerView singerName={singerName} onChangeName={clearSingerName} />}
        </main>
    );
}
