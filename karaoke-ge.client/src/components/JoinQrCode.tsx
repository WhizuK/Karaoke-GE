import { QRCodeSVG } from 'qrcode.react';

type JoinQrCodeProps = {
    url: string;
};

export function JoinQrCode({ url }: JoinQrCodeProps) {
    return (
        <figure className="join-qr-code">
            <QRCodeSVG value={url} size={240} marginSize={2} />
            <figcaption>{url}</figcaption>
        </figure>
    );
}
