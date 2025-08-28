import { useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { AxiosInstanceProps } from "../AxiosInstance";
import { ApiEndPoints } from "../ApiEndPoints";

interface UserChallengesResponse {
  success: boolean;
  message: string;
  isCompleted: boolean;
  data: Array<{
    _id: string;
    Title: string;
    like_video_count: number;
    share_video_count: number;
    rewards: Array<{
      reward_type: string;
      points: number;
      active_duration_days: number;
    }>;
    isCompleted: boolean;
  }>;
}

const fetchEnrolledChallenges = async (
  questId: string
): Promise<UserChallengesResponse> => {
  try {
    const abortController = new AbortController();
    const axiosConfig: AxiosInstanceProps = {
      url: `${ApiEndPoints.getUserChallengeDetails}?questId=${questId}`,
      method: "GET",
      signal: abortController.signal,
      headers: {
        Authorization: localStorage.getItem("token") || "",
      },
    };
    const response: AxiosResponse<UserChallengesResponse> = await axios.request(
      axiosConfig
    );
    return response.data;
  } catch (err: any) {
    throw new Error(err);
  }
};

export const useFetchEnrolledChallengesQuery = (questId: string) => {
  return useQuery<UserChallengesResponse, Error>({
    queryKey: ["Challenges", questId],
    queryFn: () => fetchEnrolledChallenges(questId),
    staleTime : 0
  });
};
