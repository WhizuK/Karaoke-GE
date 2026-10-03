
import './App.css';import { useEffect, useState } from 'react';
import './App.css';



type ServerStatus = 'a verificar...' | 'ligado' | 'sem ligação'|'a verificar...' | 'ligado' | 'sem ligação';


function App() {
    const [serverStatus, setServerStatus] = useState<ServerStatus>('a verificar...');

    useEffect(() => {
       fetch('/api/health')
            .then(response => setServerStatus(response.ok ? 'ligado' : 'sem ligação'))
            .catch(() => setServerStatus('sem ligação'));


    }, []);

return (
        <main>
            <h1>Karaoke GE</h1>
            <p>Servidor: {serverStatus}</p>
        </main>
    );
}
return (
        <main>
            <h1>Karaoke GE</h1>
            <p>Servidor: {serverStatus}</p>
        </main>
    );
}

export default App;