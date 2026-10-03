import { useEffect, useState } from 'react';
import { setVolume } from '../../services/adminCommands';

const SEND_DELAY_MS = 150;

type VolumeSliderProps = {
    volume: number;
};

export function VolumeSlider({ volume }: VolumeSliderProps) {
    const [draftVolume, setDraftVolume] = useState(volume);

    // O valor do servidor manda: se outro admin mexer, o deslizador acompanha.
    useEffect(() => {
        setDraftVolume(volume);
    }, [volume]);

    // Só enviamos quando o dedo pára por um instante, para não inundar a rede.
    useEffect(() => {
        if (draftVolume === volume) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setVolume(draftVolume).catch(error => console.error('Falha ao mudar o volume', error));
        }, SEND_DELAY_MS);

        return () => window.clearTimeout(timeoutId);
    }, [draftVolume, volume]);

    return (
        <div className="volume-slider">
            <label htmlFor="pc-volume">Volume do PC</label>
            <input
                id="pc-volume"
                type="range"
                min={0}
                max={100}
                value={draftVolume}
                onChange={event => setDraftVolume(Number(event.target.value))}
            />
            <output htmlFor="pc-volume">{draftVolume}%</output>
        </div>
    );
}
