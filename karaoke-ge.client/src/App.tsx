import { Navigate, Route, Routes } from 'react-router';
import { PhonePage } from './pages/PhonePage';
import { ScreenPage } from './pages/ScreenPage';
import './App.css';

function App() {
    return (
        <Routes>
            <Route path="/" element={<PhonePage />} />
            <Route path="/ecra" element={<ScreenPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;