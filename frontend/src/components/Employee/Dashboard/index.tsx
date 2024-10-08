import { useEffect, useState } from 'react'
import DashboardCard from './DashboardCard'
import PeopleIcon from '@mui/icons-material/People';
import BookIcon from '@mui/icons-material/Book';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
// import Chart from './Chart'
import axiosTokenInstance from '../../../api_calls/api_token_instance';
import LineChart from './LineChart';

const EmployeeDashboard = () => {
  
  const [empCount, setEmpCount] = useState(0);
  const [empDeltaPer, setEmpDeltaPer] = useState(0);
  
  const [coursesCount, setCoursesCount] = useState(0);
  const [coursesDeltaPer, setCoursesDeltaPer] = useState(0);
  
  const [avgTimeSpent, setAvgTimeSpent] = useState(0);
  const [avgTimeSpentDeltaPer, setAvgTimeSpentDeltaPer] = useState(0);
  
  const [courseEnrollmentCount, setCourseEnrollmentCount] = useState(0);
  const [courseEnrollmentDeltaPer, setCourseEnrollmentDeltaPer] = useState(0);

  useEffect(()=>{
    const empCount = async () => {
      try{
        const response = await axiosTokenInstance.get("/api/employees/empCount");
        // console.log(response);
        setEmpCount(response.data?.empCount);
        setEmpDeltaPer((response.data?.empDeltaPer).toFixed(2));
      }catch(err){
        console.log("Error at admin/empCount: ", err);
      }
    }
    const coursesCountIncrease = async () => {
      try{
        const response = await axiosTokenInstance.get("/api/courses/coursesCountIncrease");
        // console.log(response);
        setCoursesCount(response.data?.courseCount);
        setCoursesDeltaPer((response.data?.courseDeltaPer).toFixed(2));
      }catch(err){
        console.log("Error at admin/coursesCountIncrease: ", err);
      }
    }
    const avgTimeSpent = async () => {
      try{
        const response = await axiosTokenInstance.get("/api/courses/avgTimeSpentIncrease");
        // console.log(response);
        setAvgTimeSpent(response.data?.avgTimeSpent.toFixed(2));
        setAvgTimeSpentDeltaPer((response.data?.avgTimeSpentDeltaPer).toFixed(2));
      }catch(err){
        console.log("Error at admin/avgTimeSpent: ", err);
      }
    }
    const courseEnrollmentIncrease = async () => {
      try{
        const response = await axiosTokenInstance.get("/api/courses/courseEnrollmentIncrease");
        // console.log(response);
        setCourseEnrollmentCount(response.data?.courseEnrollmentCount);
        setCourseEnrollmentDeltaPer((response.data?.courseEnrollmentDeltaPer).toFixed(2));
      }catch(err){
        console.log("Error at admin/courseEnrollmentIncrease: ", err);
      }
    }
    empCount();
    coursesCountIncrease();
    avgTimeSpent();
    courseEnrollmentIncrease();
  },[]);


  const [timeUnit, setTimeUnit] = useState<"day" | "month">("day");
  const [tooltipTitle, setTooltipTitle] = useState('MMM dd, yyyy');
  const [displayXscale, setDisplayXscale] = useState("MMM dd");

  const [selectedRange, setSelectedRange] = useState<string>('avgTimePerDayLast30Days');
  const putSelectedRange = (value: string) => {
    setSelectedRange(value);
    if(value === 'avgTimePerDayLast30Days'){
      setTimeUnit("day");
      setTooltipTitle('MMM dd, yyyy');
      setDisplayXscale("MMM dd");
    }else{
      setTimeUnit("month");
      setTooltipTitle('MMM yyyy');
      setDisplayXscale("MMM");
    }
  }

  const [avgTimeSpentPeriod, setAvgTimeSpentPeriod] = useState(null);
  useEffect(()=>{
    const getAvgTimeSpent = async () => {
      try{
        const response = await axiosTokenInstance.get('/api/courses/avgTimeSpentForPeriods');
        console.log(response)
        setAvgTimeSpentPeriod(response.data);
      }catch(err){
        console.log("Error at admin/getAvgTimeSpent: ", err);
      }
    }
    getAvgTimeSpent();
  },[]);

  type TrendingCouresType = {
    id: number,
    img_url: string,
    name: string,
    certificates_count: number
  }
  const [trendingCoures, setTrendingCoures] = useState<TrendingCouresType[]>([]);
  const [limit, setLimit] = useState(5);
  const putLimit = (value : number) => {
    setLimit(value);
  }
  useEffect(() => {
    const getTrendingCoures = async () => {
      try{
        const response = await axiosTokenInstance.get(`/api/courses/topTrendingCoures/?limit=${limit}`);
        setTrendingCoures(response.data);
      }catch(err){
        console.log("Error at admin/getTopProducts: ", err);
      }
    }
    getTrendingCoures();
  },[limit]);

  return (
        <div className='flex-1 flex flex-col gap-8 p-4 min-h-screen'>
            <div className='flex flex-row flex-wrap gap-5 justify-around'>
                <DashboardCard title={"Employees Count"} value={empCount} delta_per={empDeltaPer} color="indigo" Icon={PeopleIcon}/>
                <DashboardCard title="Courses Count" value={coursesCount} delta_per={coursesDeltaPer} color="teal" Icon={BookIcon}/>
                <DashboardCard title="Avg Time Spent" value={avgTimeSpent} delta_per={avgTimeSpentDeltaPer} color="orange" Icon={AccessTimeFilledIcon}/>
                <DashboardCard title="Courses Enrollment" value={courseEnrollmentCount} delta_per={courseEnrollmentDeltaPer} color="green" Icon={SubscriptionsIcon}/>
            </div>
            <div className='  flex flex-col xl:flex-row gap-4'>
                <div className='flex-1 bg-white rounded-xl drop-shadow-lg p-4 flex flex-col '>
                    <div className='flex flex-row justify-between'>
                      <div className='font-semibold text-2xl'>Average Time Spent</div>
                      <div>
                        <select className='p-1 cursor-pointer' onChange={(e) => putSelectedRange(e.target.value)}>
                          <option value="avgTimePerDayLast30Days">Past 30 days</option>
                          <option value="avgTimePerMonthLast6Months">Past 6 months</option>
                          <option value="avgTimePerMonthLastYear">Past 12 months</option>
                        </select>
                      </div>
                    </div>
                    <div className='flex-1 flex items-center justify-center'>
                      {avgTimeSpentPeriod && avgTimeSpentPeriod[selectedRange] && <LineChart data={avgTimeSpentPeriod[selectedRange]} timeUnit={timeUnit} tooltipTitle={tooltipTitle} displayXscale={displayXscale}/>}
                    </div>
                </div>
                <div className='max-h-[30rem] w-full xl:w-96 bg-white rounded-xl drop-shadow-lg p-4 flex flex-col '>
                    <div className='flex justify-between'>
                      <span className='font-semibold text-2xl '>Top Trending Courses</span>
                      <select className='p-1 cursor-pointer' onChange={(e) => putLimit(Number(e.target.value))}>
                          <option value="5">Top 5</option>
                          <option value="10">Top 10</option>
                          <option value="50">Top 50</option>
                        </select>
                    </div>
                    <div className='p-4 flex flex-col overflow-auto gap-2'>
                      {trendingCoures &&
                        trendingCoures.map((course) => {
                          return (
                          <div key={course.id} className='flex flex-row p-2 shadow-md gap-2'>
                            <img src={course.img_url} className='w-12 h-12 object-contain' />
                            <span className='flex-1 p-1 line-clamp-2'>{course.name}</span>
                            <span>{course.certificates_count}</span>
                          </div>
                        )})
                      }
                    </div>
                </div>
            </div>
        </div>
  )
}

export default EmployeeDashboard;
