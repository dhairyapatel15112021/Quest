import { useState, useEffect } from 'react';
import { QuestState } from '../../data/Interface';
import { Trophy } from '../../components/icons/Trophy';
import { toast } from "react-toastify";
import axios, { AxiosRequestConfig } from 'axios';
import { ApiEndPoints } from '../../data/ApiEndPoints';
import { useRecoilState } from 'recoil';
import { questAtom } from '../../store/atoms/questAtom';
import { useParams } from 'react-router-dom';

export const UpdateQuest = () => {
    const [quests, setQuestAtom] = useRecoilState(questAtom);
    const { id } = useParams();
    const [questData, setQuestData] = useState<QuestState>({
        Title: "",
        Description: "",
        quest_image: new Uint8Array(),
        total_budget: 0,
        start_date: new Date(),
        end_date: new Date()
    });
    const [alwaysOn, setAlwaysOn] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        // Find the current quest from the quests atom
        const currentQuest = quests?.find(q => q.id === id);
        if (currentQuest) {
            setQuestData({
                ...currentQuest,
                start_date: new Date(currentQuest.start_date),
                end_date: currentQuest.end_date ? new Date(currentQuest.end_date) : new Date()
            });
            setAlwaysOn(!currentQuest.end_date);
            // Set image preview if image_url exists
            if (currentQuest.image_url) {
                setImagePreview(currentQuest.image_url);
            }
        }
    }, [quests]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Create image preview
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);

        // Handle the file data
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result instanceof ArrayBuffer) {
                const buffer = new Uint8Array(reader.result);
                setQuestData({ ...questData, quest_image: buffer });
            }
        };
        reader.readAsArrayBuffer(file);
    };

    // Cleanup preview URL when component unmounts
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        setQuestData({
            ...questData,
            [name]: name.includes("date") ? new Date(value) : value,
        });
    }

    const handleSubmitFunction = async () => {
        try {
            if (!questData.Title.trim()) {
                toast.error("Title is required!");
                return;
            }
            if (!questData.Description.trim()) {
                toast.error("Description is required!");
                return;
            }
            if (questData.total_budget <= 0) {
                toast.error("Total budget must be greater than 0!");
                return;
            }
            if (new Date(questData.start_date) < new Date()) {
                toast.error("Please Enter Valid Start Date!");
                return;
            }
            if (!alwaysOn && new Date(questData.end_date) < new Date(questData.start_date)) {
                toast.error("End date must be after start date!");
                return;
            }

            const formData = new FormData();
            formData.append("Title", questData.Title);
            formData.append("Description", questData.Description);
            formData.append("total_budget", questData.total_budget.toString());
            formData.append("start_date", questData.start_date.toISOString());
            formData.append("end_date", alwaysOn ? "" : questData.end_date.toISOString());

            const imageBlob = new Blob([questData.quest_image], { type: "image/png" });
            formData.append("quest_image", imageBlob, "quest_image.png");
            
            const abortController = new AbortController();
            const axiosConfig: AxiosRequestConfig = {
                url: `${ApiEndPoints.updateQuest}${id}`,
                method: "PUT",
                data: formData,
                signal: abortController.signal,
                headers: {
                    Authorization: localStorage.getItem("token"),
                    "Content-Type": "multipart/form-data"
                }
            }

            const response = await axios(axiosConfig);
            toast.success(response.data.message);
            console.log(response.data.quest);
            // Update the quest in the atom
            setQuestAtom(prevQuests => {
                if (!prevQuests) return null;
                return prevQuests.map(q => 
                    q.id === id ? { ...q,image_url: `data:image/png;base64,${response.data.quest.quest_image}`,quest_image: imageBlob, ...response.data.quest } : q
                );
            });
        }
        catch (err: any) {
            console.error('Error details:', err.response?.data);
            toast.error(err.response?.data?.message || err.response?.data?.errors || err.response?.data?.errors[0] || err.message);
        }
    }

    return (
        <div className='w-full h-full p-4'>
            <div className='font-medium text-lg text-center mb-4'>Update Quest</div>
            <div className='w-full'>
                <div className='rounded-md h-[20vh] w-full flex justify-center items-center'>
                    <input onChange={handleFileChange} type="file" id="fileInput" accept="image/*" className="hidden" />
                    <label htmlFor="fileInput" className={`${imagePreview ? 'bg-none' : 'bg-[#ecd1b2] '} transition duration-200 flex flex-col gap-2 justify-center items-center rounded-md w-full h-full cursor-pointer relative}`}>
                        {imagePreview ? (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <img 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    className="max-h-[12vh] object-contain mb-2"
                                />
                                <div className="text-xs text-blue-600 mt-1">
                                    Click to change
                                </div>
                            </div>
                        ) : (
                            <>
                                <Trophy />
                                <div className='text-lg font-light'>upload an image</div>
                            </>
                        )}
                    </label>
                </div>
                <fieldset className="fieldset w-full">
                    <legend className="fieldset-legend text-gray-700">Title</legend>
                    <input 
                        onChange={handleInputChange} 
                        name="Title" 
                        type="text" 
                        className="input text-black w-full focus:outline-none bg-[#f8f7f3] border border-black p-2" 
                        placeholder="Enter Title"
                        value={questData.Title}
                    />
                </fieldset>
                <fieldset className="fieldset w-full">
                    <legend className="fieldset-legend text-gray-700">Description</legend>
                    <input 
                        onChange={handleInputChange} 
                        name="Description" 
                        type="text" 
                        className="input text-black w-full focus:outline-none bg-[#f8f7f3] border border-black p-2" 
                        placeholder="Enter Description"
                        value={questData.Description}
                    />
                </fieldset>
                <fieldset className="fieldset w-full">
                    <legend className="fieldset-legend text-gray-700">Total Budget</legend>
                    <input 
                        onChange={handleInputChange} 
                        name="total_budget" 
                        type="number" 
                        className="input text-black w-full focus:outline-none bg-[#f8f7f3] border border-black p-2" 
                        placeholder="Enter Budget"
                        value={questData.total_budget}
                    />
                </fieldset>
                <fieldset className="fieldset w-full">
                    <legend className="fieldset-legend text-gray-700">Duration</legend>
                    <div className='flex justify-between items-center'>
                        <div 
                            onClick={() => setAlwaysOn(false)} 
                            className={`flex justify-center items-center text-black w-[50%] transition duration-200 p-2 rounded-md cursor-pointer ${!alwaysOn ? 'font-medium bg-[#ecd1b2]' : 'font-base bg-none'}`}
                        >
                            Fixed Dates
                        </div>
                        <div 
                            onClick={() => setAlwaysOn(true)} 
                            className={`flex justify-center items-center text-black w-[50%] transition duration-200 p-2 rounded-md cursor-pointer ${alwaysOn ? 'font-medium bg-[#ecd1b2]' : 'font-base bg-none'}`}
                        >
                            Always On
                        </div>
                    </div>
                    <div className='flex justify-between items-center'>
                        <fieldset className="fieldset w-[45%]">
                            <legend className="fieldset-legend text-gray-700">Start</legend>
                            <input 
                                onChange={handleInputChange} 
                                name="start_date" 
                                type="date" 
                                className="input w-full text-black focus:outline-none bg-[#f8f7f3] border border-black p-2 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:text-black [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:dark:invert-0"
                                value={questData.start_date.toISOString().split('T')[0]}
                            />
                        </fieldset>
                        {!alwaysOn && (
                            <fieldset className="fieldset w-[45%]">
                                <legend className="fieldset-legend text-gray-700">End</legend>
                                <input 
                                    onChange={handleInputChange}  
                                    name="end_date" 
                                    type="date" 
                                    className="input w-full focus:outline-none bg-[#f8f7f3] text-black border border-black p-2 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:text-black [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:dark:invert-0"
                                    value={questData.end_date.toISOString().split('T')[0]}
                                />
                            </fieldset>
                        )}
                    </div>
                </fieldset>
            </div>
            <button 
                onClick={handleSubmitFunction} 
                className='w-full mt-4 bg-blue-500 text-white px-4 py-2 rounded-3xl border border-blue-500 hover:bg-white hover:text-blue-500 cursor-pointer'
            >
                Update Quest
            </button>
        </div>
    );
};
