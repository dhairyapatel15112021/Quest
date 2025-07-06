import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Left } from '../../components/icons/Left'
import { questAtom } from '../../store/atoms/questAtom';
import { useRecoilValue } from 'recoil';
import { ChallengeQuest, ChallengeRewardQuest, QuestState } from '../../data/Interface';
import { questIdAtom } from '../../store/atoms/questIdAtom';
import { Info } from '../../components/icons/Info';
import { Loader } from '../../components/Loader';
import { toast } from 'react-toastify';
import { ApiEndPoints } from '../../query/api/ApiEndPoints';
import axios, { AxiosRequestConfig } from 'axios';

export const Challenge = () => {
  const [isLoading, setLoading] = useState(true);
  const quests = useRecoilValue(questAtom);
  const id = useRecoilValue(questIdAtom);
  const [likeState, setLikeState] = useState(false);
  const [shareState, setShareState] = useState(false);
  const [rewardCoffeState, setRewardCoffeState] = useState(false);
  const [rewardCouponState, setRewardCouponState] = useState(false);
  const [questData, setQuestData] = useState<QuestState>();
  const [challange, setChallenge] = useState<ChallengeQuest>({ Title: "", like_video_count: 0, share_video_count: 0, fk_quest_id: id || "" });
  const [points, setPoints] = useState<number>(0);
  const [expiryDuration, setExpiryDuration] = useState<number>(0);

  useEffect(() => {
    setLoading(true);
    const quest: QuestState | null = quests?.filter((q) => q.id === id)[0] || null;
    if (quest == null) {
      setLoading(false);
      return;
    }
    setQuestData(quest);
    setLoading(false);
  }, []);

  const handleChallengeInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChallenge({ ...challange, [event.target.name]: event.target.value });
  }

  const handleSubmit = async () => {
    try {
      if (challange.Title.trim() === "") {
        toast.error("Title is required.");
        return;
      }
      if (!likeState && !shareState) {
        toast.error("At least one of Like or Share must be selected.");
        return;
      }

      if (likeState && challange.like_video_count <= 0) {
        toast.error("Like count must be greater than 0.");
        return;
      }

      if (shareState && challange.share_video_count <= 0) {
        toast.error("Share count must be greater than 0.");
        return;
      }

      if (rewardCouponState && points <= 0) {
        toast.error("Reward points must be greater than 0.");
        return;
      }

      if (expiryDuration <= 0) {
        toast.error("Expiry duration must be greater than 0.");
        return;
      }
      let reward: ChallengeRewardQuest[] = [];
      if (rewardCoffeState) {
        reward.push({ reward_type: "free coffee", active_duration_days: expiryDuration });
      }
      if (rewardCouponState) {
        reward.push({ reward_type: "coupons", active_duration_days: expiryDuration, points: points });
      }
      const data = { "challenge": challange, "reward": reward };
      const abortController = new AbortController();
      const axiosConfig: AxiosRequestConfig = {
        method: "POST",
        url: ApiEndPoints.createChallenge,
        data: data,
        signal: abortController.signal,
        headers: {
          Authorization: localStorage.getItem("token")
        }
      }
      const response = await axios(axiosConfig);
      console.log(response.data);
      toast.success(response.data.message);
    }
    catch (err: any) {
      toast.error(err.response.data.message || err.response.data.errors);
    }
  }

  return (
    <>
      {
        isLoading ? <div className='h-[90vh]'><Loader /></div> : <div className='h-[90vh] text-black px-2 md:px-10 py-2 flex justify-between items-start'>
          <Link to={`/admin/quest/${id}/overview`} className='text-xs md:text-base flex justify-center items-center gap-1'>
            <Left />
            <div>Cancel</div>
          </Link>
          <div>
            <div className='font-semibold text-base md:text-lg text-center'>Quest - {questData?.Title}</div>
            <div className='font-medium text-base mt-4'>New Challenge</div>
            <div className='w-[70vw] md:w-[25vw] h-[85vh] mt-[2vh]'>
              <div className='flex gap-2'>
                <div className='flex flex-col gap-2 w-full justify-between items-center'>
                  <div className={`${likeState ? 'bg-blue-500 text-white' : 'bg-orange-200 text-black'} w-full py-3 h-fit text-center rounded-4xl cursor-pointer`} onClick={() => setLikeState(!likeState)}>Like</div>
                  {likeState && <fieldset className="fieldset w-full">
                    <input onChange={handleChallengeInputChange} name="like_video_count" type="number" className="input w-full focus:outline-none bg-[#f8f7f3] border border-black p-2" placeholder="Like Count" />
                  </fieldset>}
                </div>
                <div className='flex flex-col gap-2 w-full justify-between items-center'>
                  <div className={`${shareState ? 'bg-blue-500 text-white' : 'bg-orange-200 text-black'} w-full py-3 h-fit text-center rounded-4xl cursor-pointer`} onClick={() => setShareState(!shareState)}>Share</div>
                  {shareState && <fieldset className="fieldset w-full">
                    <input onChange={handleChallengeInputChange} name="share_video_count" type="number" className="input w-full focus:outline-none bg-[#f8f7f3] border border-black p-2" placeholder="Share Count" />
                  </fieldset>}
                </div>
              </div>
              <div className='flex flex-col gap-2 mt-2'>
                <div className='font-medium text-base'>Reward</div>
                <div className='flex gap-2'>
                  <div className='flex flex-col gap-2 w-full justify-between items-center'>
                    <div className={`${rewardCoffeState ? 'bg-blue-500 text-white' : 'bg-orange-200 text-black'} w-full py-3 h-fit text-center rounded-4xl cursor-pointer`} onClick={() => setRewardCoffeState(!rewardCoffeState)}>Free Coffee?</div>
                  </div>
                  <div className='flex flex-col gap-2 w-full justify-between items-center'>
                    <div className={`${rewardCouponState ? 'bg-blue-500 text-white' : 'bg-orange-200 text-black'} w-full py-3 h-fit text-center rounded-4xl cursor-pointer`} onClick={() => setRewardCouponState(!rewardCouponState)}>Coupons?</div>
                    {rewardCouponState && <fieldset className="fieldset w-full">
                      <input onChange={(event) => setPoints(parseInt(event.target.value))} name="points" type="number" className="input w-full focus:outline-none bg-[#f8f7f3] border border-black p-2" placeholder="Reward Points" />
                    </fieldset>}
                  </div>
                </div>
              </div>
              <fieldset className="fieldset w-full mt-2">
                <div className='flex justify-between items-center'>
                  <legend className="fieldset-legend text-base text-gray-700">Reward Expiry</legend>
                  <div className="tooltip tooltip-bottom md:tooltip-right flex justify-between items-center" data-tip="How many days reward should active after claim.">
                    <button><Info /></button>
                  </div>
                </div>
                <input onChange={(event) => setExpiryDuration(parseInt(event.target.value))} name="active_duration_days" type="number" className="input text-black w-full focus:outline-none bg-[#f8f7f3] border border-black p-2" placeholder='Enter Days' />
              </fieldset>
              <fieldset className="fieldset w-full">
                <legend className="fieldset-legend text-base text-gray-700">Title</legend>
                <input onChange={handleChallengeInputChange} name="Title" type="text" className="input w-full focus:outline-none bg-[#f8f7f3] border border-black p-2" placeholder="Enter Title" />
              </fieldset>
            </div>
          </div>
          <button onClick={handleSubmit} className='bg-blue-500 text-white text-xs md:text-base px-2 md:px-4 py-1 rounded-3xl border border-blue-500 hover:bg-white hover:text-blue-500 cursor-pointer'>Create</button>
        </div>
      }
    </>
  )
}
