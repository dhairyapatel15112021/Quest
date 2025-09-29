import { useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { ApiEndPoints } from "../ApiEndPoints";
import { AxiosInstanceProps } from "../AxiosInstance";
import { queryClient } from "../../../App";

interface Reward {
  _id: string;
  reward_type: "free coffee" | "coupons";
  is_claimed: boolean;
  status: "active" | "claimed";
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
  message: string;
  data: {
    summary: RewardSummary;
    rewards: Reward[];
  };
}

interface ClaimRewardResponse {
  data : {reward_type : string,points_added : number},  
  success: boolean;
  message: string;
}

const fetchRewards = async (): Promise<RewardResponse> => {
  try {
    const abortController = new AbortController();
    const axiosConfig: AxiosInstanceProps = {
      url: ApiEndPoints.getUserRewards,
      signal: abortController.signal,
      method: "GET",
      headers: { Authorization: localStorage.getItem("token") || "" },
    };
    const response: AxiosResponse<RewardResponse> = await axios.request(
      axiosConfig
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const useFetchRewardsQuery = () => {
  return useQuery<RewardResponse, Error>({
    queryKey: ["Rewards"],
    queryFn: fetchRewards,
  });
};

const claimReward = async (rewardId: string): Promise<ClaimRewardResponse> => {
  try {
    const abortController = new AbortController();
    const axiosConfig: AxiosInstanceProps = {
      url: `${ApiEndPoints.claimReward}${rewardId}`,
      signal: abortController.signal,
      method: "PUT",
      headers: { Authorization: localStorage.getItem("token") || "" },
    };
    const response: AxiosResponse<ClaimRewardResponse> = await axios.request(
      axiosConfig
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const useClaimRewardMutation = () => {
  return useMutation<ClaimRewardResponse, Error, string>({
    mutationFn: (rewardId: string) => claimReward(rewardId),
  });
};

export const updateRewardData = (rewardId: string) => {
  queryClient.setQueryData<RewardResponse>(["Rewards"], (old) => {
    if (!old) return old;
    return {
      ...old,
      data: {
        ...old.data,
        rewards: old.data.rewards.map((reward) =>
          reward._id === rewardId ? { ...reward, is_claimed: true, status : "claimed" } : reward
        ),
      },
    };
  });
};
