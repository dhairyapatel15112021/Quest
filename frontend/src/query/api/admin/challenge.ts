import { useMutation, useQuery } from '@tanstack/react-query';
import axios, { AxiosResponse } from "axios";
import { ChallengeQuest, ChallengeRewardQuest } from "../../../data/Interface";
import { ApiEndPoints } from "../ApiEndPoints";

export type CreateChallengeResponse = AxiosResponse<{
    message: string;
}>;

const createChallenge = async (challenge : ChallengeQuest , reward : ChallengeRewardQuest[]) : Promise<CreateChallengeResponse> => {
    try{
      const abortController = new AbortController();
      const axiosConfig = {
        method: "POST",
        url: ApiEndPoints.createChallenge,
        data: { "challenge": challenge, "reward": reward },
        signal: abortController.signal,
        headers: {
          Authorization: localStorage.getItem("token")
        }
      }
      const response = await axios.request(axiosConfig);
      return response.data as CreateChallengeResponse;
    }
    catch(err : any) {
        throw new Error(err);
    }
}

export const useCreateChallengeMutation = () => {
    return useMutation<CreateChallengeResponse, Error, { challenge: ChallengeQuest, reward: ChallengeRewardQuest[] }>({
        mutationFn : ({ challenge, reward }) => createChallenge(challenge, reward)
    });
};

export interface ChallengeResponse {
    success: boolean,
    message: string,
    data :{ data: {
        challenges: Challenge[],
        questStats: {
            totalChallenges: number,
            totalParticipants: number,
            fullyCompletedUsers: number,
            fullyCompletedPercentage: number,
            halfCompletedUsers: number,
            halfCompletedPercentage: number
        }
    }
}
}

export interface Challenge {
    _id: string,
    like_video_count: number,
    share_video_count: number,
    Title: string,
    quest: {
        Title: string;
        Description: string;
    };
    rewards: Array<{
        reward_type: "free coffee" | "coupon";
        points?: number;
        active_duration_days: number;
    }>;
}


const fetchChallenges = async (questId : string) : Promise<ChallengeResponse>  => {
  try{ 
    const abortController = new AbortController();
    const axiosConfig = {
      url: `${ApiEndPoints.getChallenge}?quest_id=${questId}`,
      method: 'GET',
      headers: {
        Authorization: localStorage.getItem('token')
      },
      signal: abortController.signal
    };
    const response : ChallengeResponse = await axios.request(axiosConfig);
    return response;
  }
  catch(err : any) {
    throw new Error(err);
  }
}

export const useFetchChallengesQuery = (questId: string) => {
  return useQuery<ChallengeResponse,Error>({
    queryKey: ['fetchChallenges', questId],
    queryFn: () => fetchChallenges(questId),
    enabled: !!questId,
  });
};
