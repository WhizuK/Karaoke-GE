import { useEffect, useState } from 'react';
import { registerSinger } from '../services/singerSession';
import type { Singer, SingerIdentity } from '../types/singer';
import { getUserMessage } from '../utils/hubError';

type SingerRegistration =
    | { status: 'pending' }
    | { status: 'registered'; singer: Singer }
    | { status: 'failed'; message: string };

export function useSingerRegistration({ id, name }: SingerIdentity): SingerRegistration {
    const [registration, setRegistration] = useState<SingerRegistration>({ status: 'pending' });

    useEffect(() => {
        let isCancelled = false;

        registerSinger({ id, name })
            .then(singer => {
                if (!isCancelled) {
                    setRegistration({ status: 'registered', singer });
                }
            })
            .catch(error => {
                if (!isCancelled) {
                    setRegistration({ status: 'failed', message: getUserMessage(error) });
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [id, name]);

    return registration;
}
