import { useEffect, useState } from 'react'
import { Left } from '../../components/icons/Left'
import { Link, NavLink, useParams } from 'react-router-dom'
import { Setting } from '../../components/icons/Setting'
import { EllipsisHorizontal } from '../../components/icons/EllipsisHorizontal'
import { useRecoilState } from 'recoil'
import { questAtom } from '../../store/atoms/questAtom'
import { Loader } from '../../components/Loader'
import { QuestState } from '../../data/Interface'
import { Delete } from '../../components/icons/Delete'
import { ApiEndPoints } from '../../data/ApiEndPoints'
import axios, { AxiosRequestConfig } from 'axios'
import { toast } from 'react-toastify'
import { UpdateQuest } from './UpdateQuest'

export const QuestBanner = () => {
    const [isLoading, setLoading] = useState(true);
    const [quests, setQuestAtom] = useRecoilState(questAtom);
    const { id } = useParams();
    const [questData, setQuestData] = useState<QuestState>();

    useEffect(() => {
        setLoading(true);
        const quest: QuestState | null = quests?.filter((q) => q.id === id)[0] || null;
        if (quest == null) {
            setLoading(false);
            return;
        }
        setQuestData(quest);
        setLoading(false);
    }, [quests]);

    const handleToggle = async (value: boolean) => {
        try {
            const abortController = new AbortController();
            const axiosConfig: AxiosRequestConfig = {
                method: "PUT",
                url: ApiEndPoints.toggleQuestActiveStatus + questData?.id,
                signal: abortController.signal,
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            }
            const response = await axios(axiosConfig);
            setQuestData(() => ({ ...questData, Title: questData?.Title || '', Description: questData?.Description || '', start_date: questData?.start_date || new Date(), end_date: questData?.end_date || new Date(), total_budget: questData?.total_budget || 0, total_participates: questData?.total_participates || 0, quest_image: questData?.quest_image || new Uint8Array(), id: questData?.id || '', is_Active: response.data.quest.is_Active }));
            toast.success(response.data.message);
        }
        catch (error: any) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    return (
        <>
            {
                isLoading ? <div className='h-[30vh] bg-gray-700 text-white rounded-2xl px-28'><Loader /></div> :
                    <div className='h-[30vh] bg-gray-700 text-white rounded-2xl px-28 flex flex-col justify-between'>
                        <div className='p-2 flex justify-between items-center justify-self-start'>
                            <Link to="/admin/dashboard" className='bg-gray-500 text-white p-2 rounded-full'><Left /></Link>
                            <div className='flex justify-center items-center gap-2'>
                                <div className="drawer drawer-end z-10">
                                    <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
                                    <div className="drawer-content">
                                        {/* Page content here */}
                                        <label htmlFor="my-drawer-4" className="drawer-button"> <div className='bg-gray-500 text-white p-2 rounded-full'><Setting /></div></label>
                                    </div>
                                    <div className="drawer-side">
                                        <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                                        <ul className="menu bg-[#f8f7f3] text-base-content min-h-full w-100 p-4">
                                          <UpdateQuest />
                                        </ul>
                                    </div>
                                </div>


                                <div className="dropdown dropdown-end">
                                    <div tabIndex={0} role="button" className="cursor-pointer rounded-full p-2 bg-gray-500 text-white">
                                        <EllipsisHorizontal />
                                    </div>
                                    <ul tabIndex={0} className="dropdown-content menu bg-white text-black rounded-box z-1 w-fit p-2 shadow-sm">
                                        <li>
                                            <div className='flex justify-between items-center gap-2 w-full h-full'>
                                                <div>
                                                    {questData?.is_Active === "created" ? "Unpublished" :
                                                        questData?.is_Active === "completed" ? "Completed" : "Published"}
                                                </div>
                                                <div>
                                                    <input
                                                        type="checkbox"
                                                        className={`toggle h-6 w-9 bg-none transition-all duration-300 ${questData?.is_Active === "created" ? '!bg-red-200' : '!bg-green-200'
                                                            }`}
                                                        onChange={(event) => handleToggle(event?.target.checked)}
                                                    />
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className='flex justify-between items-center gap-2 w-full h-full text-red-600'>
                                                <div>Delete</div>
                                                <div><Delete /></div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                            </div>
                        </div>
                        <div className='px-2 flex justify-between items-center'>
                            <div className='flex flex-col items-start gap-1'>
                                <div className='font-semibold text-4xl'>{questData?.Title}</div>
                                <div className='font-light text-base'>{questData?.start_date.toString().split("T")[0]}{questData?.end_date ? ` - ${questData?.end_date.toString().split("T")[0]}` : ' - ♾️'}</div>
                                <div className='font-extralight bg-gray-800 px-2 py-1 rounded-md w-fit'>{questData?.total_budget}</div>
                            </div>
                            <img src={questData?.image_url} alt="photo.png" className='rounded-2xl h-[100px]' />
                        </div>
                        <div className='flex gap-4'>
                            <NavLink to={`/admin/quest/${id}/overview`} className={({ isActive }) => `${isActive ? 'border-b-[3px] border-orange-300' : 'border-none'} text-base py-3`}>Overview</NavLink>
                            <NavLink to={`/admin/quest/${id}/participates`} className={({ isActive }) => `${isActive ? 'border-b-[3px] border-orange-300' : 'border-none'} text-base py-3`}>Participants</NavLink>
                        </div>
                    </div>
            }
        </>
    )
}
