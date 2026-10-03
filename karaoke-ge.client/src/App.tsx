import { useConnectedDevices } from './hooks/useConnectedDevices';
import './App.css';

function App() {
    const connectedDevices = useConnectedDevices();

    return (
        <main>
            <h1>Karaoke GE</h1>
            <p>Dispositivos ligados: {connectedDevices}</p>
        </main>
    );
}
export default App
