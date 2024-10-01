import React, {  useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api_calls/api_instance';
import axios from 'axios';

const SignupForm : React.FC = () => {

    type UserFormType = {
        emp_id: string;
        emp_name: string;
        email: string;
        designation: string;
        password: string;
    }
    const [userForm, setUserForm] = useState<UserFormType>({
        emp_id: '',
        emp_name: '',
        email: '',
        designation: 'SOFTWARE_ENGINEER',
        password: ''
    })

    const [error, setError] = useState<string>('');
    // const navigate = useNavigate();

    const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        const name: string = e.target.id;
        const value: string = e.target.value;
        setUserForm(form => ({...form, [name]: value}));
    }

    type validateDetailsProps = {
        emp_id: string;
        emp_name: string;
        email: string;
        designation: string;
        password: string;
    }
    const validateDetails = ({emp_id, emp_name, email, designation, password} : validateDetailsProps) : boolean => {
        return emp_id.trim().length !== 0 && emp_name.trim().length !== 0 && email.trim().length !== 0 && email.endsWith('@jmangroup.com') && designation.trim().length !== 0 && password.trim().length !== 0;
    }

    // signup
    const handleSubmit = async (event : React.MouseEvent<HTMLInputElement, MouseEvent>) : Promise<void> => {
        event.preventDefault();
        if(!validateDetails(userForm)){
            setError('All values required !!');
            return;
        }
        try{
            const response = await axiosInstance.post('/api/signupEmp', userForm);
            console.log("signup response: ",response);
            // navigate('/login');
            window.location.reload();
        }catch(err : unknown){
            if (axios.isAxiosError(err)) {
                // This is an Axios error, so it has a response property
                console.log("Error at signup handleSubmit: ", err);
                setError(err.response?.data?.error)
            } else {
                // Handle other types of errors (non-Axios errors)
                console.log("Error at signup handleSubmit: ", err);
            }
        }
    }

    return (
        <div className='p-7 flex flex-col gap-10'>
            <span className='font-semibold text-2xl'>The secret of getting ahead is getting started.</span> 
            <div>
                {error && <span className='text-error-light'>{error}</span>}
                <form className="flex flex-col justify-between gap-12">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="emp_id" className="font-medium">Employee ID</label>
                            <input type="text" placeholder="Enter Employee ID (JMDXXX)" id="emp_id" className="p-1 border-2 border-zinc-300" required value={userForm.emp_id} onChange={(e) => handleInputOnChange(e)}/>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="emp_name" className="font-medium">Employee Name</label>
                            <input type="text" placeholder="Enter Employee Name" id="emp_name" className="p-1 border-2 border-zinc-300" required value={userForm.emp_name} onChange={(e) => handleInputOnChange(e)}/>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="font-medium">Employee email</label>
                            <input type="email" placeholder="Enter Employee Email" id="email" className="p-1 border-2 border-zinc-300" required value={userForm.email} onChange={(e) => handleInputOnChange(e)}/>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="userConfirmPassword" className="font-medium">Designation</label>
                            <select
                            id="designation"
                            value={userForm.designation}
                            onChange={(e) => handleInputOnChange(e)}
                            className="w-full p-1 border-2 border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="SOFTWARE_ENGINEER">SOFTWARE ENGINEER</option>
                                <option value="SR_SOFTWARE_ENGINEER">SR SOFTWARE ENGINEER</option>
                                <option value="SOLUTION_ENABLER">SOLUTION ENABLER</option>
                                <option value="SOLUTION_CONSULTANT">SOLUTION CONSULTANT</option>
                                <option value="TECHNOLOGY_SOLUTION_ARCHITECT">TECHNOLOGY SOLUTION ARCHITECT</option>
                                <option value="PRINCIPAL_SOLUTION_ARCHITECT">PRINCIPAL SOLUTION ARCHITECT</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="font-medium">Password</label>
                            <input type="password" placeholder="Enter Password" id="password" className="p-1 border-2 border-zinc-300" required value={userForm.password} onChange={(e) => handleInputOnChange(e)}/>
                        </div>
                    </div>
                    <input type='submit' className="bg-primary-light rounded-md text-white p-1 cursor-pointer"  value='Sign Up' onClick={(e) => handleSubmit(e)}/>
                </form>
            </div>
        </div>
    )
}

export default SignupForm;
