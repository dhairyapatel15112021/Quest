import { useQuery } from '@tanstack/react-query';
import axios from "axios";
import { ApiEndPoints } from "../ApiEndPoints";
import { AxiosInstanceProps } from "../AxiosInstance";

interface ChallengeResponse {
  success: boolean;
  message: string;
  data: {
    totalParticipants: number;
    participants: Array<{
      _id: string;
      firstname: string;
      lastname: string;
      challenges: Array<{
        _id: string;
        title: string;
        isCompleted: boolean;
        like_video_count: number;
        share_video_count: number;
      }>;
      rewards: {
        points: number;
        freeCoffee: number;
      };
    }>;
  };
}

const fetchParticipants = async (
  questId: string
): Promise<ChallengeResponse> => {
  try {
    const abortController = new AbortController();
    const axiosConfig: AxiosInstanceProps = {
      url: `${ApiEndPoints.getQuestParticipantsDetails}?questId=${questId}`,
      signal: abortController.signal,
      method: "GET",
      headers: {
        Authorization: localStorage.getItem("token") || "",
      },
    };
    const response = await axios.request(axiosConfig);
    return response.data as ChallengeResponse;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const useFetchParticipantsQuery = (questId: string) => {
  return useQuery<ChallengeResponse, Error>({
    queryKey: ["participants", questId],
    queryFn: () => fetchParticipants(questId),
  });
};