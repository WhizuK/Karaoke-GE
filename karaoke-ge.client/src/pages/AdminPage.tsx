import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminLoginForm } from '../components/admin/AdminLoginForm';
import { ConnectingNotice } from '../components/ConnectingNotice';
import { useAdminSession } from '../hooks/useAdminSession';

export function AdminPage() {
    const { status, error, login, logout } = useAdminSession();

    return (
        <main className="admin-page">
            {status === 'checking' && <ConnectingNotice />}
            {status === 'logged-out' && (
                <>
                    <header className="phone-welcome">
                        <h1>Admin do karaoke</h1>
                        <p>Escreve o PIN para controlar a fila e o som.</p>
                    </header>
                    <AdminLoginForm error={error} onLogin={login} />
                </>
            )}
            {status === 'logged-in' && <AdminDashboard onLogout={logout} />}
        </main>
    );
}
