import { Navigate, Outlet } from 'react-router-dom'
import { decryptText } from '../helper_functions/encrypt_decrypt';
import { Navbar } from '../components/Navbar';

export const AdminProtectedRoute = () => {
    const auth_token = sessionStorage.getItem('authToken');
    const role = decryptText(sessionStorage.getItem('role'));
    return (
        auth_token ? (role === 'ADMIN' ? 
            <div className='border-0 p-0 flex flex-row'>
                <Navbar/>
                <Outlet/>
            </div>
            : <Navigate to="/" />) : <Navigate to="/login" />
    )
}