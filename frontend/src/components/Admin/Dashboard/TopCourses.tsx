// TopCourses.tsx
import React, { useEffect, useState } from 'react';
import axiosTokenInstance from '../../../api_calls/api_token_instance';

type TrendingCouresType = {
    id: number,
    img_url: string,
    name: string,
    certificates_count: number
  }
  
const TopCourses: React.FC = () => {
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
        <div className=' w-full xl:w-96 overflow-auto bg-white rounded-xl drop-shadow-lg p-4 flex flex-col '>
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
                    <img src={course.img_url} className='w-12 h-12 object-cover' />
                    <span className='flex-1 p-1 line-clamp-2'>{course.name}</span>
                    <span>{course.certificates_count}</span>
                </div>
                )})
            }
            </div>
        </div>
  );
};

export default TopCourses;
