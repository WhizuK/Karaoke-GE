import { useSingerRegistration } from '../hooks/useSingerRegistration';
import type { SingerIdentity } from '../types/singer';
import { ConnectingNotice } from './ConnectingNotice';
import { SingerDashboard } from './SingerDashboard';

type SingerViewProps = {
    identity: SingerIdentity;
    onChangeName: () => void;
};

export function SingerView({ identity, onChangeName }: SingerViewProps) {
    const registration = useSingerRegistration(identity);

    switch (registration.status) {
        case 'pending':
            return <ConnectingNotice />;
        case 'failed':
            return (
                <>
                    <p className="form-error" role="alert">{registration.message}</p>
                    <button type="button" onClick={onChangeName}>
                        Trocar nome
                    </button>
                </>
            );
        case 'registered':
            return <SingerDashboard singer={registration.singer} onChangeName={onChangeName} />;
    }
}
