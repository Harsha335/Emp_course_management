import { useNavigate } from 'react-router-dom';
import './index.css'
import { decryptText } from '../../helper_functions/encrypt_decrypt';
import { adminNavbarComponents, employeeNavbarComponents } from '../../helper_functions/navbar_elements';

export const Navbar = () => {
    const navigate = useNavigate();
    const role = decryptText(sessionStorage.getItem('role'));
    const navComponents = role === 'ADMIN' ? adminNavbarComponents : employeeNavbarComponents;
    const handleLogout = () => {
        sessionStorage.removeItem('authToken');
        navigate('/login');
    }
    return (
        <div className='w-[300px] fixed'>
            <div id="side-nav" className="flex flex-col w-full gap-5 pt-5 p-4 justify-between min-h-screen">
                <span className="flex flex-col gap-20 text-white">
                    {/* E-commerce logo */}
                    <span className='flex items-center justify-center'>
                        <span className='text-xl font-semibold'>{navComponents.title}</span>
                    </span>
                    {/* Navigation links */}
                    <span className="flex gap-8 flex-col">
                        {
                            navComponents.routes.map((route) => {
                                const Icon = route.icons;
                                return (
                                    <a className="nav-item" href={`${route.url}`}>
                                        <span className='mr-2'>{<Icon/>}</span>
                                        {`${route.name}`}
                                    </a>
                                )
                            })
                        }
                        {/* <a className="nav-item" href="/projects">
                            <span className='mr-2'><AssignmentIcon/></span>
                            Projects
                        </a> */}
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
