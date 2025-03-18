import { useEffect, useState } from 'react'
import { Card } from '../../components/Card';
import { Plus } from '../../components/icons/Plus';
import { Trophy } from '../../components/icons/Trophy';
import { toast } from 'react-toastify';
import { ApiEndPoints } from '../../data/ApiEndPoints';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../../components/icons/User';
import { Ellipsis } from '../../components/icons/Ellipsis';
import { Loader } from '../../components/Loader';
import { useSetRecoilState } from 'recoil';
import { questAtom } from '../../store/atoms/questAtom';
import { questIdAtom } from '../../store/atoms/questIdAtom';

interface DashboardData {
    success: boolean,
    quests: Array<{
        _id: string,
        Title: string,
        Description: string,
        start_date: Date,
        end_date: Date,
        total_budget: number,
        is_Active: string,
        quest_image: string,
        analytics: {
            totalParticipants: number,
            totalLikedVideos: number,
            totalSharedVideos: number,
            totalRewardsDistributed: number,
            isActive: boolean
        }
    }>,
    overallStats: {
        totalActiveQuests: number,
        totalParticipants: number,
        totalLikedVideos: number,
        totalSharedVideos: number,
        totalRewardsDistributed: number
    }
}

export const Dashboard = () => {
    const [quests, setQuests] = useState<DashboardData["quests"]>([]);
    const [overallStats, setOverallStats] = useState<DashboardData["overallStats"]>();
    const [isLoading, setLoading] = useState(true);
    const setQuestIdAtom = useSetRecoilState(questIdAtom);
    const setQuestAtom = useSetRecoilState(questAtom);
    const navigate = useNavigate();

    const data = [
        { title: "Number of Active Quests", key: "totalActiveQuests" as keyof DashboardData["overallStats"] },
        { title: "Number of Liked Videos", key: "totalLikedVideos" as keyof DashboardData["overallStats"] },
        { title: "Number of Shared Videos", key: "totalSharedVideos" as keyof DashboardData["overallStats"] },
        { title: "Total Pointes Distributed", key: "totalRewardsDistributed" as keyof DashboardData["overallStats"] }
    ];

    const getQuests = async () => {
        try {
            setLoading(true);
            const abortController = new AbortController();
            const axiosConfig: AxiosRequestConfig = {
                url: ApiEndPoints.getAllQuests,
                method: "GET",
                signal: abortController.signal,
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            }
            const response: AxiosResponse = await axios(axiosConfig);
            const data: DashboardData = response.data;
            
            const processedQuests: DashboardData["quests"] = data.quests.map(quest => ({
                ...quest,
                quest_image: quest.quest_image ? `data:image/jpeg;base64,${quest.quest_image}` : ''
            }));
            
            setQuests(processedQuests);
            setQuestAtom(processedQuests.map(({ _id,is_Active, Title, Description, start_date, end_date, total_budget, quest_image }) => ({
                id : _id,
                Title,
                Description,
                start_date,
                end_date,
                total_budget,
                quest_image: new Uint8Array(0), // Empty Uint8Array as placeholder
                image_url: quest_image,
                is_Active
            })));
            setOverallStats(data.overallStats);
        }
        catch (err: any) {
            toast.error(err.response?.data?.message || err.message);
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getQuests();
    }, []);

    const redirectToQuestDetails = (id: string) => {
        setQuestIdAtom(id);
        navigate(`/admin/quest/${id}/overview`);
    }

    return (
        <div className='relative top-0 left-0 h-fit md:h-[90vh] w-screen bg-[#f8f7f3]'>
            <div className='w-full h-[40vh] md:h-[15vh] px-9 md:px-10 py-2 grid md:grid-cols-4 grid-cols-1 grid-rows-4 md:grid-rows-1 gap-5'>
                {
                    data?.map((d, index) => (
                        <Card 
                            key={index} 
                            title={d.title} 
                            numericData={(overallStats?.[d.key] ?? 0)} 
                            isLoading={isLoading}
                        />
                    ))
                }
            </div>
            <div className='w-full h-[73vh] flex flex-col mt-[2vh] px-10 py-2'>
                {/* Sticky Quest Header */}
                <div className='sticky top-0 z-10 bg-[#f8f7f3] pb-4'>
                    <div className='flex justify-between items-center'>
                        <div className='text-black text-xl font-medium md:font-semibold'>Quests</div>
                        <Link to="/admin/quest/create" className='flex text-sm justify-center items-center gap-1 bg-blue-500 text-white p-2 rounded-4xl'>
                            <div><Plus /></div>
                            <div>New Quests</div>
                        </Link>
                    </div>
                    {!isLoading && quests.length > 0 && (
                        <div className='mt-3 grid grid-cols-9 grid-rows-1 text-gray-500 py-2 font-bold text-sm border-b-[0.1px]'>
                            <div className='col-span-6'>Details</div>
                            <div>Participants</div>
                            <div>Status</div>
                            <div></div>
                        </div>
                    )}
                </div>

                {/* Scrollable Content */}
                <div className='flex-1 overflow-y-auto'>
                    {
                        isLoading ? (
                            <div className='h-full flex justify-center items-center'>
                                <Loader />
                            </div>
                        ) : quests?.length === 0 ? (
                            <div className='h-full flex justify-center items-center'>
                                <div className='text-black flex justify-center items-center flex-col gap-2'>
                                    <div><Trophy /></div>
                                    <div className='font-medium text-lg'>Ignite Engagement With Quests</div>
                                </div>
                            </div>
                        ) : (
                            <div className='space-y-4 pt-2'>
                                {quests.map((quest) => (
                                    <div key={quest._id} className='grid grid-cols-9 grid-rows-1 place-items-start text-gray-500 py-2 font-bold text-sm'>
                                        <div className='col-span-6 grid grid-cols-4 grid-rows-1 w-full'>
                                           <div className='flex justify-center items-center'> <img onClick={() => redirectToQuestDetails(quest._id)} src={quest.quest_image} className='rounded-2xl h-[100px] cursor-pointer' alt="quest.png" /></div>
                                            <div className='flex flex-col gap-1'>
                                                <div className='text-lg font-semibold text-black'>{quest.Title}</div>
                                                <div className='text-sm font-light text-black'>{quest.Description}</div>
                                                <div className='text-gray-600 text-xs font-extralight'>{quest.start_date.toString().split("T")[0]}{quest.end_date ? ` - ${quest.end_date.toString().split("T")[0]}` : ' - ♾️'}</div>
                                                <div className='p-1 text-xs font-extralight rounded-md text-gray-600 border-[0.2px] border-gray-400 w-fit'>{quest.total_budget}</div>
                                            </div>
                                        </div>
                                        <div className='flex justify-start gap-2 font-base item-center'>
                                            <User />
                                            <div>{quest.analytics.totalParticipants}</div>
                                        </div>
                                        <div className='flex justify-start item-center p-1 h-fit text-xs font-extralight rounded-md text-gray-600 border-[0.2px] border-gray-400 w-fit'>
                                            {quest.is_Active === "created" ? "Unpublished" : quest.is_Active === "completed" ? "Completed" : "Published"}
                                        </div>
                                        <div onClick={() => redirectToQuestDetails(quest._id)} className='cursor-pointer'>
                                            <Ellipsis />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}
