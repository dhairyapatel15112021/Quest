import axios, { AxiosRequestConfig } from 'axios';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { ApiEndPoints } from '../../query/api/ApiEndPoints';
import { Loader } from '../../components/Loader';
import { Link } from 'react-router-dom';

interface Quest {
    _id: string,
    Title: string,
    Description: string,
    start_date: Date,
    end_date: Date,
    quest_image: string, // base64 encoded
    totalParticipants: number,
    userQuestStatus: string | null // "In Progress" | "Completed" | null
}

export const Quests = () => {
    const [quests, setQuests] = useState<Quest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchQuests = async () => {
        try {
            setIsLoading(true);
            const abortController = new AbortController();
            const axiosConfig: AxiosRequestConfig = {
                method: 'GET',
                url: ApiEndPoints.getActiveQuests,
                signal: abortController.signal,
                headers: {
                    Authorization: localStorage.getItem('token')
                }
            }
            const response = await axios(axiosConfig);
            console.log(response.data);
            setQuests(response.data.quests);
        }
        catch (error: any) {
            toast.error(error?.response?.data?.error || error?.response?.data.message);
        }
        finally {
            setIsLoading(false);
        }
    };

    const enrollQuest = async (questId: string) => {
        try {
            const axiosConfig: AxiosRequestConfig = {
                method: 'POST',
                url: `${ApiEndPoints.enrollChallenge}${questId}`,
                headers: {
                    Authorization: localStorage.getItem('token')
                }
            };

            const response = await axios(axiosConfig);
            if (response.data.success) {
                toast.success(response.data.message);
                // Refresh the quests list to show updated status
                await fetchQuests();
            } else {
                toast.error(response.data.message);
            }
        }
        catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to enroll in quest");
        }
    }

    useEffect(() => {
        fetchQuests();
    }, []);
    return (
        <>
            {
                isLoading ? (
                    <div className='w-full h-full flex items-center justify-center'>
                        <Loader />
                    </div>
                ) : (
                    quests.length > 0 ? (
                        <div className='py-5 w-full min-w-fit h-full grid grid-cols-2 gap-y-5 justify-items-center overflow-y-scroll'>
                            {quests.map((quest) => (
                                <div key={quest._id} className='relative w-4/5 bg-white h-fit rounded-lg flex flex-col items-center justify-center'>
                                    <img src={`data:image/jpeg;base64,${quest.quest_image}`} alt={quest.Title} className='w-full h-[130px] object-cover rounded-tr-2xl rounded-tl-2xl' />
                                    <img src={`data:image/jpeg;base64,${quest.quest_image}`} alt={quest.Title} className='absolute top-[50%] left-0 w-full h-[130px] object-cover rounded-br-2xl rounded-bl-2xl' />
                                    <div className='w-full flex flex-col gap-1 bg-[#36454f]/80 backdrop-blur-sm backdrop-saturate-50 border border-white/10 shadow-sm shadow-black/40 justify-center p-3 rounded-br-2xl rounded-bl-2xl'>
                                        <div className='text-base text-white/90 font-medium'>{quest.Title}</div>
                                        <div className='text-sm text-gray-400/90 text-wrap md:text-nowrap font-light'>
                                            {quest.start_date.toString().split('T')[0]} - {quest.end_date ? quest.end_date.toString().split('T')[0] : '♾️'}
                                        </div>
                                        <div className='text-sm text-gray-300/90 text-nowrap font-normal'>{quest.totalParticipants} Participants</div>
                                        <div className='p-1 my-2 text-xs font-extralight rounded-md text-gray-200/90 border border-gray-400/30 backdrop-blur-sm w-fit hover:border-gray-400/50 transition-colors'>
                                            {quest.userQuestStatus ? <Link to={`/user/quest/${quest._id}/progress`} className='cursor-pointer'>{quest.userQuestStatus}</Link> : <div className='cursor-pointer' onClick={() => enrollQuest(quest._id)}>Join</div>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='w-full h-full flex flex-col items-center justify-center gap-4'>
                            <div className='text-6xl'>😔</div>
                            <div className='text-xl text-gray-600'>No Active Quests available.</div>
                        </div>
                    )
                )
            }
        </>
    )
}
