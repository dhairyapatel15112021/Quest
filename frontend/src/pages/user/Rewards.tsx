import axios, { AxiosRequestConfig } from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ApiEndPoints } from '../../data/ApiEndPoints';
import { Loader } from '../../components/Loader';
import { FaCoffee, FaGift, FaTicketAlt } from 'react-icons/fa';
import { userAtom } from '../../store/atoms/userAtom';
import { useSetRecoilState } from 'recoil';
import { UserState } from '../../data/Interface';

interface Reward {
  _id: string;
  reward_type: 'free coffee' | 'coupons';
  is_claimed: boolean;
  status: 'active' | 'claimed';
  reward_amount?: number;
}

interface RewardSummary {
  total_rewards: number;
  total_points: number;
  total_free_coffee: number;
  claimed_rewards: number;
  active_rewards: number;
  expired_rewards: number;
}

interface RewardResponse {
  success: boolean;
  data: {
    summary: RewardSummary;
    rewards: Reward[];
  };
}


export const Rewards = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [rewardsData, setRewardsData] = useState<RewardResponse | null>(null);
  const setUserData = useSetRecoilState(userAtom);

  const fetchRewards = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<RewardResponse>(
        ApiEndPoints.getUserRewards,
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      setRewardsData(response.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch rewards");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleClaimReward = async (id: string) => {
    try {
      const abortController = new AbortController();
      const axiosConfig : AxiosRequestConfig = {
        url : `${ApiEndPoints.claimReward}${id}`,
        method : "PUT",
        headers : {
          Authorization : localStorage.getItem("token")
        },
        signal : abortController.signal
      }
      const response = await axios(axiosConfig);
      toast.success(response.data.data.message || "Reward claimed successfully");
      setUserData((userData: UserState | null) => userData ? {...userData, wallet: response.data.data.wallet || 0} : null);
      await fetchRewards();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to claim reward");
    }
  };

  if (isLoading) {
    return (
      <div className='w-full h-full flex items-center justify-center'>
        <Loader />
      </div>
    );
  }

  if (!rewardsData?.data.rewards.length) {
    return (
      <div className='w-full h-full flex flex-col items-center justify-center gap-4'>
        <div className='text-6xl'>😔</div>
        <div className='text-xl text-gray-600'>No rewards available yet</div>
        <div className='text-sm text-gray-500'>Complete challenges to earn rewards!</div>
      </div>
    );
  }

  return (
    <div className='p-4 w-full h-full'>
      {/* Summary Section */}
      <div className='mb-8 grid md:grid-rows-2 grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='rounded-lg p-2 shadow-sm border border-gray-100'>
          <div className='text-sm text-gray-500'>Total Points</div>
          <div className='text-xl font-semibold text-amber-600'>{rewardsData.data.summary.total_points}</div>
        </div>
        <div className='rounded-lg p-2 shadow-sm border border-gray-100'>
          <div className='text-sm text-gray-500'>Free Coffee</div>
          <div className='text-xl font-semibold text-amber-600'>{rewardsData.data.summary.total_free_coffee}</div>
        </div>
        <div className='rounded-lg p-2 shadow-sm border border-gray-100'>
          <div className='text-sm text-gray-500'>Active Rewards</div>
          <div className='text-xl font-semibold text-amber-600'>{rewardsData.data.summary.active_rewards}</div>
        </div>
        <div className='rounded-lg p-2 shadow-sm border border-gray-100'>
          <div className='text-sm text-gray-500'>Claimed Rewards</div>
          <div className='text-xl font-semibold text-amber-600'>{rewardsData.data.summary.claimed_rewards}</div>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-scroll h-[70%]'>
        {rewardsData.data.rewards.map((reward) => (
          <div
            key={reward._id}
            className={`relative bg-white rounded-lg shadow-sm border h-fit ${reward.is_claimed ? 'border-gray-200' : 'border-amber-200'
              }`}
          >
            {/* Reward Image/Icon */}
            <div className={`w-full h-32 flex items-center justify-center ${reward.is_claimed ? 'bg-gray-50' : 'bg-amber-50'
              }`}>
              {reward.is_claimed ? (
                reward.reward_type === 'free coffee' ? (
                  <FaCoffee className='w-12 h-12 text-gray-400' />
                ) : (
                  <FaTicketAlt className='w-12 h-12 text-gray-400' />
                )
              ) : (
                <FaGift className='w-12 h-12 text-amber-500' />
              )}
            </div>

            {/* Reward Details */}
            <div className='p-4'>
              <div className='flex items-center justify-between'>
                <div className='text-sm font-light text-gray-600'>
                  {reward.reward_type === 'free coffee' ? 'Free Coffee' : `${reward.reward_amount} Points`}
                </div>
                <div className={`text-sm px-2 py-1 rounded-full ${reward.is_claimed
                    ? 'bg-gray-100 text-gray-600 text-sm font-light'
                    : 'bg-amber-100 text-amber-600 text-sm font-light'
                  }`}>
                  <div>{!reward.is_claimed && 'Available'}</div>
                  {reward.is_claimed && <div className='text-xs font-light text-gray-600'>{reward.status}</div>}

                </div>
              </div>

              {/* Action Button */}
              {!reward.is_claimed && (
                <button
                  onClick={() => handleClaimReward(reward._id)}
                  className='w-full mt-4 bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition-colors'
                >
                  Claim Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
