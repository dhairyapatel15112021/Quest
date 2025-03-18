import { Link } from 'react-router-dom'
import { Left } from '../../components/icons/Left'
import { useState, useEffect } from 'react'
import { QuestState } from '../../data/Interface';
import { Trophy } from '../../components/icons/Trophy';
import { toast } from "react-toastify";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiEndPoints } from '../../data/ApiEndPoints';

export const QuestCreate = () => {
  const [questData, setQuestData] = useState<QuestState>({ Title: "", Description: "", quest_image: new Uint8Array(), total_budget: 0, start_date: new Date(), end_date: new Date() });
  const [alwaysOn, setAlwaysOn] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
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
      [name]: name.includes("date") ? new Date(value) : value, // Convert date fields
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
      if(new Date(questData.start_date) < new Date()){
        toast.error("Please Enter Valid Start Date!");
        return;
      }
      if (!alwaysOn && new Date(questData.end_date) < new Date(questData.start_date)) {
        toast.error("End date must be after start date!");
        return;
      }
      if (questData.quest_image.length === 0) {
        toast.error("Please upload an image!");
        return;
      }

      const imageBlob = new Blob([questData.quest_image], { type: "image/png" });

      const formData = new FormData();
      formData.append("Title", questData.Title);
      formData.append("Description", questData.Description);
      formData.append("total_budget", questData.total_budget.toString());
      formData.append("start_date", questData.start_date.toISOString());
      formData.append("end_date", alwaysOn ? "" : questData.end_date.toISOString());
      formData.append("quest_image", imageBlob, "quest_image.png");


      const abortController = new AbortController();
      const axiosConfig: AxiosRequestConfig = {
        url: ApiEndPoints.createQuest,
        method: "POST",
        data: formData,
        signal: abortController.signal,
        headers: {
          Authorization: localStorage.getItem("token"),
          "Content-Type": "multipart/form-data"
        }
      }
      const response: AxiosResponse = await axios(axiosConfig);
      toast.success(response.data.message);
    }
    catch (err: any) {
      console.log(err);
      toast.error( err.response?.data?.message || err.response?.data?.errors || err.response?.data?.errors[0] || err.message);
    }
  }

  return (
    <div className='h-[90vh] text-black px-2 md:px-10 py-2 flex justify-between items-start'>
      <Link to="/admin/dashboard" className='text-xs md:text-base flex justify-center items-center gap-1'>
        <Left />
        <div>Cancel</div>
      </Link>
      <div>
        <div className='font-medium text-base md:text-lg text-center'>New Quest</div>
        <div className='w-[70vw] md:w-[25vw] h-[85vh] mt-[2vh]'>
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
                  {/* <div className="text-sm font-medium text-gray-700 truncate max-w-[90%]">
                    {fileName}
                  </div> */}
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
            <input onChange={handleInputChange} name="Title" type="text" className="input w-full focus:outline-none bg-[#f8f7f3] border border-black p-2" placeholder="Enter Title" />
          </fieldset>
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend text-gray-700">Description</legend>
            <input onChange={handleInputChange} name="Description" type="text" className="input w-full focus:outline-none bg-[#f8f7f3] border border-black p-2" placeholder="Enter Description" />
          </fieldset>
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend text-gray-700">Total Budget</legend>
            <input onChange={handleInputChange} name="total_budget" type="number" className="input w-full focus:outline-none bg-[#f8f7f3] border border-black p-2" placeholder="Enter Budget" />
          </fieldset>
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend text-gray-700">Duration</legend>
            <div className='flex justify-between items-center'>
              <div onClick={() => setAlwaysOn(false)} className={`flex justify-center items-center w-[50%] transition duration-200 p-2 rounded-md cursor-pointer ${!alwaysOn ? 'font-medium bg-[#ecd1b2]' : 'font-base bg-none'}`}>Fixed Dates</div>
              <div onClick={() => setAlwaysOn(true)} className={`flex justify-center items-center w-[50%] transition duration-200 p-2 rounded-md cursor-pointer ${alwaysOn ? 'font-medium bg-[#ecd1b2]' : 'font-base bg-none'}`}>Always On</div>
            </div>
            <div className='flex justify-between items-center'>
              <fieldset className="fieldset w-[45%]">
                <legend className="fieldset-legend text-gray-700">Start</legend>
                <input 
                  onChange={handleInputChange} 
                  name="start_date" 
                  type="date" 
                  className="input w-full focus:outline-none bg-[#f8f7f3] border border-black p-2 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:text-black [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:dark:invert-0" 
                />
              </fieldset>
              {
                !alwaysOn && <fieldset className="fieldset w-[45%]">
                  <legend className="fieldset-legend text-gray-700">End</legend>
                  <input 
                    onChange={handleInputChange}  
                    name="end_date" 
                    type="date" 
                    className="input w-full focus:outline-none bg-[#f8f7f3] border border-black p-2 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:text-black [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:dark:invert-0" 
                  />
                </fieldset>
              }
            </div>
          </fieldset>
        </div>
      </div>
      <button onClick={handleSubmitFunction} className='bg-blue-500 text-white text-xs md:text-base px-2 md:px-4 py-1 rounded-3xl border border-blue-500 hover:bg-white hover:text-blue-500 cursor-pointer'>Save</button>
    </div>
  )
}
