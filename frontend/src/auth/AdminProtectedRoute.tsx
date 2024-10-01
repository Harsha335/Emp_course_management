import { Navigate, Outlet } from 'react-router-dom'
import { decryptText } from '../helper_functions/encrypt_decrypt';

export const AdminProtectedRoute = () => {
    const auth_token = sessionStorage.getItem('authToken');
    const role = decryptText(sessionStorage.getItem('role'));
    return (
        auth_token ? (role === 'ADMIN' ? <Outlet/> : <Navigate to="/" />) : <Navigate to="/login" />
    )
}