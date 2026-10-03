import { JoinQrCode } from './components/JoinQrCode';
import { useConnectedDevices } from './hooks/useConnectedDevices';
import { useJoinUrl } from './hooks/useJoinUrl';
import './App.css';

function App() {
    const connectedDevices = useConnectedDevices();
    const joinUrl = useJoinUrl();

    return (
        <main>
            <h1>Karaoke GE</h1>
            <p>Dispositivos ligados: {connectedDevices}</p>
            {joinUrl
                ? <JoinQrCode url={joinUrl} />
                : <p>A procurar a rede local...</p>}
        </main>
    );
}

export default App;
