import { Link } from 'react-router';
import { isAdminDevice } from '../services/adminPinStorage';

export function AdminEntryLink() {
    return (
        <Link className="text-link" to="/admin">
            {isAdminDevice() ? 'Abrir o painel de admin' : 'Sou admin'}
        </Link>
    );
}
