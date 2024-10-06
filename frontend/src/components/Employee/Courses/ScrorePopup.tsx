import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type ParamsType = {
    data : {
        score : number,
        total: number,
        percentage: number
    }
};

// Function to determine the motivational message based on the percentage score
const getMotivationalMessage = (percentage: number) => {
    if (percentage >= 90) {
        return { message: "Excellent job! You're a star!", color: 'text-green-600' };
    } else if (percentage >= 75) {
        return { message: "Great work! Keep it up!", color: 'text-blue-600' };
    } else if (percentage >= 50) {
        return { message: "Good effort! You can do even better!", color: 'text-orange-600' };
    } else {
        return { message: "Don't give up! Keep practicing!", color: 'text-red-600' };
    }
};


const ScorePopup: React.FC<ParamsType> = ({data}) => {
    const navigate = useNavigate();
    const { message, color } = getMotivationalMessage(data.percentage);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">Your Score</h2>
                <p className="text-4xl font-bold text-blue-600 text-center">{data.score}{"/"}{data.total}</p>
                <div className="mt-4 text-center">
                    <p className="text-lg text-gray-700">Percentage: <span className="font-semibold">{data.percentage.toFixed(2)}%</span></p>
                    <p className={`mt-4 text-lg font-semibold ${color} text-center`}>{message}</p>
                </div>
                <div className="flex justify-center mt-6">
                    <button 
                        className="bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition duration-300" 
                        onClick={() => {navigate(-1);}}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScorePopup;