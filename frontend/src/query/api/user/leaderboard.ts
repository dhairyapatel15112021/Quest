import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ApiEndPoints } from "../ApiEndPoints";
import { AxiosInstanceProps } from "../AxiosInstance";

interface LeaderboardResponse {
  success: boolean;
  message: string;
  data: {
    totalEnrolledUsers: number;
    leaderboard: Array<{
      _id: string;
      firstname: string;
      lastname: string;
      rewards: {
        points: number;
        freeCoffee: number;
        coupons: {
          description: string;
        };
      };
    }>;
  };
}

const fetchLeaderBoard = async (
  questId: string
): Promise<LeaderboardResponse> => {
  try {
    const abortController = new AbortController();
    const axiosConfig: AxiosInstanceProps = {
      url: `${ApiEndPoints.getQuestLeaderboard}?questId=${questId}`,
      method: "GET",
      signal: abortController.signal,
      headers: {
        Authorization: localStorage.getItem("token") || "",
      },
    };
    const response = await axios.request(axiosConfig);
    return response.data as LeaderboardResponse;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const useFetchLeaderBoardQuery = (questId: string) => {
  return useQuery<LeaderboardResponse, Error>({
    queryKey: ["Leaderboard", questId],
    queryFn: () => fetchLeaderBoard(questId),
  });
};
