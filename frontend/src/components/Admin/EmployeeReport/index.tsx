import React, { useState, useEffect } from 'react';
import axiosTokenInstance from '../../../api_calls/api_token_instance';
import EmployeeReportPopup from './EmployeeReportPopup';

type Employee = {
  emp_id: string;
  email: string;
  emp_name: string;
  designation: string;
  performance_rating?: number | null;
};

const designations =   ['SOFTWARE_ENGINEER','SR_SOFTWARE_ENGINEER','SOLUTION_ENABLER','SOLUTION_CONSULTANT','TECHNOLOGY_SOLUTION_ARCHITECT','PRINCIPAL_SOLUTION_ARCHITECT']

const EmployeeReport: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [sortAsc, setSortAsc] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [employees, setEmployees] = useState<Employee[]>();

  const itemsPerPage = 10; // Pagination limit

  useEffect(()=> {
    const getEmployeesData = async () => {
        try{
            const response = await axiosTokenInstance.get("/api/employees/");
            console.log(response)
            setEmployees(response.data.employees);
        }catch(err){
            console.log(err);
        }
    }
    getEmployeesData();
  },[]);

  // Handle search and filters
  const filteredEmployees = employees
    ?.filter((emp) =>
      emp.emp_id.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((emp) =>
      selectedDesignation ? emp.designation === selectedDesignation : true
    )
    .sort((a, b) => {
      if (sortAsc === true) {
        return (a.performance_rating || 0) - (b.performance_rating || 0);
      } else if(sortAsc === false) {
        return (b.performance_rating || 0) - (a.performance_rating || 0);
      }else{
        return 0;
      }
    });

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees?.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(filteredEmployees?.length === undefined ? 0 : filteredEmployees.length / itemsPerPage);

  // Handle sorting
  const handleSortToggle = () => {
    setSortAsc(prev => prev === null ? true : prev === false ? null : !prev);
  };
  const [popUpEmp, setPopUpEmp] = useState<string | null> (null);
  const popUpEmpPerformance = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, emp_id: string) => {
    e.preventDefault();
    setPopUpEmp(emp_id);
  }
  const closePopUp = () => {
    setPopUpEmp(null);
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Employee Report</h1>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by Employee ID"
          className="border p-2 rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="border p-2 rounded-lg"
          value={selectedDesignation}
          onChange={(e) => setSelectedDesignation(e.target.value)}
        >
          <option value="">All Designations</option>
          {
            designations.map(designation => (
              <option value={designation}>{designation}</option>
            ))
          }
        </select>
      </div>

      {/* Table */}
      <table className="table-auto w-full bg-white shadow-md rounded-lg">
        <thead>
          <tr className="bg-gray-300">
            <th className="p-3 text-left">Employee ID</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Designation</th>
            <th className="p-3 text-left cursor-pointer" onClick={handleSortToggle}>
              Performance Rating {sortAsc === null ? '': sortAsc ? '▲' : '▼'}
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedEmployees?.map((emp) => (
            <tr key={emp.emp_id} className="border-t cursor-pointer hover:bg-gray-200" onClick={(e) => popUpEmpPerformance(e,emp.emp_id)}>
              <td className="p-3">{emp.emp_id}</td>
              <td className="p-3">{emp.emp_name}</td>
              <td className="p-3">{emp.designation}</td>
              <td className="p-3">{emp.performance_rating ? emp.performance_rating.toFixed(2): 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 bg-gray-300 rounded-lg ${currentPage === 1 && 'cursor-not-allowed'}`}
        >
          Previous
        </button>

        <span>Page {currentPage} of {totalPages}</span>

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 bg-gray-300 rounded-lg ${currentPage === totalPages && 'cursor-not-allowed'}`}
        >
          Next
        </button>
      </div>
      {popUpEmp && <EmployeeReportPopup emp_id={popUpEmp} closePopUp={closePopUp}/>}
    </div>
  );
};

export default EmployeeReport;