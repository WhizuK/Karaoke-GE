import { useCallback, useEffect, useRef, useState } from 'react';

type LockableOrientation = ScreenOrientation & {
    lock?: (orientation: 'landscape') => Promise<void>;
};

/**
 * Ecrã inteiro para um elemento.
 * Usa a Fullscreen API quando o browser deixa (Android, PC) e, em qualquer caso,
 * ativa um modo "ecrã inteiro" por CSS — o iPhone não permite a API em elementos
 * que não sejam vídeo, por isso o CSS é o que garante que funciona em todo o lado.
 */
export function useFullscreen<TElement extends HTMLElement>() {
    const elementRef = useRef<TElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const enter = useCallback(() => {
        setIsFullscreen(true);

        elementRef.current?.requestFullscreen?.()
            .then(() => (screen.orientation as LockableOrientation).lock?.('landscape'))
            .catch(() => {
                // Sem Fullscreen API ou sem rotação: o modo CSS já cobre o ecrã.
            });
    }, []);

    const exit = useCallback(() => {
        setIsFullscreen(false);

        if (document.fullscreenElement !== null) {
            document.exitFullscreen().catch(() => {
                // Já tinha saído (por exemplo, com o botão "voltar" do Android).
            });
        }
    }, []);

    useEffect(() => {
        // Se a pessoa sair pelo botão "voltar" do telemóvel, desligamos também o modo CSS.
        function handleFullscreenChange() {
            if (document.fullscreenElement === null) {
                setIsFullscreen(false);
            }
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return { elementRef, isFullscreen, enter, exit };
}
