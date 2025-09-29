import { toast } from "react-toastify";
import { Loader } from "../../components/Loader";
import { FaCoffee, FaGift, FaTicketAlt } from "react-icons/fa";
import { userAtom } from "../../store/atoms/userAtom";
import { useSetRecoilState } from "recoil";
import { UserState } from "../../data/Interface";
import {
  updateRewardData,
  useClaimRewardMutation,
  useFetchRewardsQuery,
} from "../../query/api/user/rewards";

export const Rewards = () => {
  const setUserData = useSetRecoilState(userAtom);
  const { data: rewards, isLoading, isError } = useFetchRewardsQuery();
  const { mutate: claimReward, isPending } = useClaimRewardMutation();

  const handleClaimReward = (id: string) => {
    if (isPending) return;
    claimReward(id, {
      onSuccess({ data: { reward_type, points_added }, message }) {
        toast.success(message || "Reward claimed successfully");
        if (reward_type === "coupons")
          setUserData((userData: UserState | null) =>
            userData ? { ...userData, wallet: points_added || 0 } : null
          );
        updateRewardData(id);
      },
      onError(error) {
        toast.error(error.message || "Failed to claim reward");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isError) {
    toast.error("Failed to fetch rewards");
    return;
  }

  if (!rewards?.data) return;

  if (!rewards?.data.rewards.length) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">😔</div>
        <div className="text-xl text-gray-600">No rewards available yet</div>
        <div className="text-sm text-gray-500">
          Complete challenges to earn rewards!
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 w-full h-full">
      {/* Summary Section */}
      <div className="mb-8 grid md:grid-rows-2 grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg p-2 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">Total Points</div>
          <div className="text-xl font-semibold text-amber-600">
            {rewards.data.summary.total_points}
          </div>
        </div>
        <div className="rounded-lg p-2 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">Free Coffee</div>
          <div className="text-xl font-semibold text-amber-600">
            {rewards.data.summary.total_free_coffee}
          </div>
        </div>
        <div className="rounded-lg p-2 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">Active Rewards</div>
          <div className="text-xl font-semibold text-amber-600">
            {rewards.data.summary.active_rewards}
          </div>
        </div>
        <div className="rounded-lg p-2 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">Claimed Rewards</div>
          <div className="text-xl font-semibold text-amber-600">
            {rewards.data.summary.claimed_rewards}
          </div>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-scroll h-[70%]">
        {rewards.data.rewards.map((reward) => (
          <div
            key={reward._id}
            className={`relative bg-white rounded-lg shadow-sm border h-fit ${
              reward.is_claimed ? "border-gray-200" : "border-amber-200"
            }`}
          >
            {/* Reward Image/Icon */}
            <div
              className={`w-full h-32 flex items-center justify-center ${
                reward.is_claimed ? "bg-gray-50" : "bg-amber-50"
              }`}
            >
              {reward.is_claimed ? (
                reward.reward_type === "free coffee" ? (
                  <FaCoffee className="w-12 h-12 text-gray-400" />
                ) : (
                  <FaTicketAlt className="w-12 h-12 text-gray-400" />
                )
              ) : (
                <FaGift className="w-12 h-12 text-amber-500" />
              )}
            </div>

            {/* Reward Details */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-light text-gray-600">
                  {reward.reward_type === "free coffee"
                    ? "Free Coffee"
                    : `${reward.reward_amount} Points`}
                </div>
                <div
                  className={`text-sm px-2 py-1 rounded-full ${
                    reward.is_claimed
                      ? "bg-gray-100 text-gray-600 text-sm font-light"
                      : "bg-amber-100 text-amber-600 text-sm font-light"
                  }`}
                >
                  <div>{!reward.is_claimed && "Available"}</div>
                  {reward.is_claimed && (
                    <div className="text-xs font-light text-gray-600">
                      {reward.status}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              {!reward.is_claimed && (
                <button
                  onClick={() => handleClaimReward(reward._id)}
                  className="w-full mt-4 bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition-colors"
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
