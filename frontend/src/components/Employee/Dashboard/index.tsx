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
  
  const [totalCoursesAssigned, setTotalCoursesAssigned] = useState<number >(0);
  const [totalCoursesAssignedDeltaPer, setTotalCoursesAssignedDeltaPer] = useState<number >(0);
  
  const [totalCertificates, settotalCertificates] = useState<number >(0);
  const [totalCertificatesDeltaPer, setTotalCertificatesDeltaPer] = useState<number >(0);
  
  const [avgTestScore, setAvgTestScore] = useState<number>(0);
  const [avgTestScoreDeltaPer, setAvgTestScoreDeltaPer] = useState<number>(0);

  const [avgTimeSpent, setAvgTimeSpent] = useState<number >(0);
  const [avgTimeSpentDeltaPer, setAvgTimeSpentDeltaPer] = useState<number>(0);
  

  useEffect(()=>{
    const getData = async () => {
      try{
        const response = await axiosTokenInstance.get("/api/employees/getEmployeeStatistics");
        type resType = {
          curr: number,
          prev: number
        }
        type resNullType = {
          curr: number | null,
          prev: number | null
        }
        const {totalCoursesAssigned, totalCertificates, avgTestScore, avgTimeSpent} : {totalCoursesAssigned : resType, totalCertificates : resType, avgTestScore : resNullType, avgTimeSpent : resNullType} = response.data;
        setTotalCoursesAssigned(totalCoursesAssigned.curr);
        setTotalCoursesAssignedDeltaPer( Number((((totalCoursesAssigned.curr - totalCoursesAssigned.prev)/totalCoursesAssigned.curr)*100).toFixed(2)));
        settotalCertificates(totalCertificates.curr);
        setTotalCertificatesDeltaPer( Number((((totalCertificates.curr - totalCertificates.prev)/totalCertificates.curr)*100).toFixed(2)));
        setAvgTestScore(avgTestScore?.curr || 0);
        const deltaAvgTestScore = avgTestScore.curr === null ? 0 : avgTestScore.prev === null? avgTestScore.curr : (((avgTestScore.curr - avgTestScore.prev)/avgTestScore.curr)*100).toFixed(2);
        setAvgTestScoreDeltaPer( Number(deltaAvgTestScore));
        setAvgTimeSpent(avgTimeSpent?.curr || 0);
        const deltaAvgTimeSpent = avgTimeSpent.curr === null ? 0 : avgTimeSpent.prev === null? avgTimeSpent.curr : (((avgTimeSpent.curr - avgTimeSpent.prev)/avgTimeSpent.curr)*100).toFixed(2);
        setAvgTimeSpentDeltaPer( Number(deltaAvgTimeSpent));
      }catch(err){
        console.log("Error at admin/getEmployeeStatistics: ", err);
      }
    }
    getData();
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
        const response = await axiosTokenInstance.get('/api/courses/empAvgTimeSpentForPeriods');
        console.log(response)
        setAvgTimeSpentPeriod(response.data);
      }catch(err){
        console.log("Error at emp/getAvgTimeSpent: ", err);
      }
    }
    getAvgTimeSpent();
  },[]);

  // type TrendingCouresType = {
  //   id: number,
  //   img_url: string,
  //   name: string,
  //   certificates_count: number
  // }
  // const [trendingCoures, setTrendingCoures] = useState<TrendingCouresType[]>([]);
  // const [limit, setLimit] = useState(5);
  // const putLimit = (value : number) => {
  //   setLimit(value);
  // }
  // useEffect(() => {
  //   const getTrendingCoures = async () => {
  //     try{
  //       const response = await axiosTokenInstance.get(`/api/courses/topTrendingCoures/?limit=${limit}`);
  //       setTrendingCoures(response.data);
  //     }catch(err){
  //       console.log("Error at admin/getTopProducts: ", err);
  //     }
  //   }
  //   getTrendingCoures();
  // },[limit]);

  return (
        <div className='flex-1 flex flex-col gap-8 p-4'>
            <div className='flex flex-row flex-wrap gap-5 justify-around'>
                <DashboardCard title={"Courses Assigned"} value={totalCoursesAssigned} delta_per={totalCoursesAssignedDeltaPer} color="indigo" Icon={PeopleIcon}/>
                <DashboardCard title="Certificates Count" value={totalCertificates} delta_per={totalCertificatesDeltaPer} color="teal" Icon={BookIcon}/>
                <DashboardCard title="Avg Test Score" value={avgTestScore} delta_per={avgTestScoreDeltaPer} color="orange" Icon={AccessTimeFilledIcon}/>
                <DashboardCard title="Avg Time Spent" value={avgTimeSpent} delta_per={avgTimeSpentDeltaPer} color="green" Icon={SubscriptionsIcon}/>
            </div>
            {/* <div className='  flex flex-col xl:flex-row gap-4'> */}
            <div className='w-full bg-white rounded-xl drop-shadow-lg p-4 flex flex-col'>
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
                {avgTimeSpentPeriod && avgTimeSpentPeriod[selectedRange] && (
                  <div className='w-full h-[40rem] flex items-center justify-center'> {/* This div will help the chart fill the remaining space */}
                    <LineChart 
                      data={avgTimeSpentPeriod[selectedRange]} 
                      timeUnit={timeUnit} 
                      tooltipTitle={tooltipTitle} 
                      displayXscale={displayXscale}
                    />
                  </div>
                )}
              </div>
            </div>

                {/* <div className=' w-full xl:w-96 bg-white rounded-xl drop-shadow-lg p-4 flex flex-col '>
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
                </div> */}
            {/* </div> */}
        </div>
  )
}

export default EmployeeDashboard;
