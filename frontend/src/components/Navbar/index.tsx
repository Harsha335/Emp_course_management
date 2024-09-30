import { useNavigate } from 'react-router-dom';
import './index.css'
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';

export const Navbar = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        sessionStorage.removeItem('authToken');
        navigate('/login');
    }
    return (
        <div className='w-[300px] '>
            <div id="side-nav" className="flex flex-col w-full gap-5 pt-5 p-4 justify-between min-h-screen">
                <span className="flex flex-col gap-20 text-white">
                    {/* E-commerce logo */}
                    <span className='flex items-center justify-center'>
                        <span className='text-xl font-semibold'>Task Management System</span>
                    </span>
                    {/* Navigation links */}
                    <span className="flex gap-8 flex-col">
                        <a className="nav-item" href="/">
                            <span className='mr-2'><DashboardIcon/></span>
                            Dashboard
                        </a>
                        <a className="nav-item" href="/projects">
                            <span className='mr-2'><AssignmentIcon/></span>
                            Projects
                        </a>
                    </span>
                </span>
                {/* User details and logout */}
                <span className='flex flex-col gap-3'>
                    {/* <span className='text-white text-center'>{userName}</span> */}
                    <button className="bg-white cursor-pointer rounded-md position-absolute p-2" style={{bottom: "5rem"}} onClick={() => handleLogout()}>Logout</button>
                </span>
            </div>
        </div>
    )
}
