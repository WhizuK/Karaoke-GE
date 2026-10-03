import { QRCodeSVG } from 'qrcode.react';

type JoinQrCodeProps = {
    url: string;
    size?: number;
};

export function JoinQrCode({ url, size = 240 }: JoinQrCodeProps) {
    return (
        <figure className="join-qr-code">
            <QRCodeSVG value={url} size={size} marginSize={2} />
            <figcaption>{url}</figcaption>
        </figure>
    );
}
