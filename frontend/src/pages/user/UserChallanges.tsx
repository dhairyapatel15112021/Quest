import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ApiEndPoints } from '../../data/ApiEndPoints';
import { Trophy } from '../../components/icons/Trophy';
import { Loader } from '../../components/Loader';
import { Heart } from '../../components/icons/Heart';
import { Share } from '../../components/icons/Share';
import { Coffee } from '../../components/icons/Coffee';
import { Coupon } from '../../components/icons/Coupon';
import { Flag } from '../../components/icons/Flag';

interface UserChallangesData {
    success: boolean,
    message: string,
    isCompleted :boolean,
    data: Array<{
        _id: string,
        Title: string,
        like_video_count: number,
        share_video_count: number,
        rewards: Array<{
            reward_type: string,
            points: number,
            active_duration_days: number
        }>,
        isCompleted: boolean
    }>
}

export const UserChallanges = () => {
    const { id } = useParams();
    const [userChallanges, setUserChallanges] = useState<UserChallangesData["data"] | []>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const getUserChallanges = async () => {
        try {
            setIsLoading(true);
            setIsCompleted(false);
            const axiosConfig: AxiosRequestConfig = {
                url: `${ApiEndPoints.getUserChallengeDetails}?questId=${id}`,
                method: "GET",
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            }
            const response: AxiosResponse<UserChallangesData> = await axios(axiosConfig);
            setUserChallanges(response.data.data);
            setIsCompleted(response.data.isCompleted);
        }
        catch (error: any) {
            setIsCompleted(false);
            toast.error(error.response.data.message || error.response.data.error || error.message);
        }
        finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getUserChallanges();
    }, []);

    return (
        <div className='flex-1 mt-4 rounded-xl p-6 mx-30 shadow-lg min-h-0 h-[50vh]'>
            <div className='text-base font-medium mb-4 text-gray-600'>Challenges</div>
            <div className='h-full'>
                {isLoading ? (
                    <div className='flex justify-center items-center h-32'>
                        <Loader/>
                    </div>
                ) : userChallanges.length === 0 ? (
                    <div className='flex flex-col items-center justify-center h-32 text-gray-500'>
                        <Trophy />
                        <div>No challenges available</div>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 place-content-start gap-4 pr-2 overflow-y-scroll h-[95%]'>
                        {userChallanges.map((challenge) => (
                            <div key={challenge._id} className={`grid grid-rows-1 grid-cols-9 place-items-center justify-items-start rounded-xl p-4 transition-shadow ${challenge.isCompleted ? 'bg-gray-100 cursor-not-allowed' : 'bg-[#efede5]'}`}>
                                {!isCompleted && (
                                    <Link to={`/user/quest/${id}/progress/video/feed/${challenge._id}`} className="contents">
                                        <div className='col-span-1 flex items-center'>
                                            <Flag className={`${challenge.isCompleted ? 'text-green-400 bg-green-100 rounded-full p-2 h-fit w-fit' : 'text-gray-400 bg-gray-200 rounded-full p-2 h-fit w-fit'}`}/>
                                        </div>
                                        <div className='col-span-2 text-xs md:text-sm font-medium text-black'>{challenge.Title || "No Title"}</div>
                                    </Link>
                                )}
                                {isCompleted && (
                                    <>
                                        <div className='col-span-1 flex items-center'>
                                            <Flag className={`${challenge.isCompleted ? 'text-green-400 bg-green-100 rounded-full p-2 h-fit w-fit' : 'text-gray-400 bg-gray-200 rounded-full p-2 h-fit w-fit'}`}/>
                                        </div>
                                        <div className='col-span-2 text-xs md:text-sm font-medium text-black'>{challenge.Title || "No Title"}</div>
                                    </>
                                )}
                                <div className='col-span-3 flex gap-4'>
                                    <div className='flex items-center gap-2 text-rose-500 font-light'>
                                        <Heart className='w-5 h-5' />
                                        <span>{challenge.like_video_count || 0} likes</span>
                                    </div>
                                    <div className='flex items-center gap-2 text-blue-500 font-light'>
                                        <Share className='w-5 h-5' />
                                        <span>{challenge.share_video_count || 0} shares</span>
                                    </div>
                                </div>

                                <div className='col-span-3 flex flex-wrap gap-2'>
                                    {challenge.rewards.map((reward, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${reward.reward_type === 'free coffee'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-emerald-100 text-emerald-700'
                                                }`}
                                        >
                                            {reward.reward_type === 'free coffee' ? (
                                                <>
                                                    <Coffee className='w-4 h-4' />
                                                    <span>Free Coffee</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Coupon className='w-4 h-4' />
                                                    <span>{reward.points} Points</span>
                                                </>
                                            )}
                                            <span className='text-xs'>({reward.active_duration_days}d)</span>
                                        </div>
                                    ))}
                                    
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
