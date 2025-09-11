import { useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { AxiosInstanceProps } from "../AxiosInstance";
import { ApiEndPoints } from "../ApiEndPoints";
import { queryClient } from "../../../App";

interface QuestsResponse {
  success: boolean;
  message: string;
  quests: Array<{
    _id: string;
    Title: string;
    Description: string;
    start_date: Date;
    end_date: Date;
    quest_image: string; // base64 encoded
    totalParticipants: number;
    userQuestStatus: string | null; // "In Progress" | "Completed" | null
  }>;
}

interface UserQuestResponse {
  success: boolean;
  message: string;
  data: {
    questTitle: string;
    questImage: string; // base64
    daysLeft: number | null; // null for always-on quests
    isCompleted: boolean;
    progress: {
      totalChallenges: number;
      completedChallenges: number;
    };
  };
}

export interface EnrollQuestResponse {
  success: boolean;
  message: string;
}

const ActiveQuests = async (): Promise<QuestsResponse["quests"]> => {
  try {
    const abortController = new AbortController();
    const axiosConfig: AxiosInstanceProps = {
      url: ApiEndPoints.getActiveQuests,
      method: "GET",
      signal: abortController.signal,
      headers: {
        Authorization: localStorage.getItem("token") || "",
      },
    };
    const response: AxiosResponse<QuestsResponse> = await axios.request(
      axiosConfig
    );
    return response.data.quests;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const useFetchActiveQuestQuery = () => {
  return useQuery<QuestsResponse["quests"], Error>({
    queryKey: ["ActiveQuests"],
    queryFn: ActiveQuests,
  });
};

export const updateQuestData = (questId: string) => {
  queryClient.setQueryData<QuestsResponse["quests"]>(
    ["ActiveQuests"],
    (old) => {
      if (!old) return;
      return old.map((quest) =>
        quest._id === questId
          ? {
              ...quest,
              userQuestStatus: "In Progress",
            }
          : quest
      );
    }
  );
};

const enrollQuest = async (questId: string): Promise<EnrollQuestResponse> => {
  try {
    const abortController = new AbortController();
    const axiosConfig: AxiosInstanceProps = {
      url: `${ApiEndPoints.enrollChallenge}${questId}`,
      method: "POST",
      signal: abortController.signal,
      headers: {
        Authorization: localStorage.getItem("token") || "",
      },
    };
    const response: AxiosResponse<EnrollQuestResponse> = await axios.request(
      axiosConfig
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const useQuestEnrollMutationQuery = () => {
  return useMutation<EnrollQuestResponse, Error, string>({
    mutationFn: (questId: string) => enrollQuest(questId),
  });
};

const fetchQuestDetails = async (
  questId: string
): Promise<UserQuestResponse> => {
  try {
    const abortController = new AbortController();
    const axiosConfig: AxiosInstanceProps = {
      url: `${ApiEndPoints.getQuestDetails}?questId=${questId}`,
      method: "GET",
      headers: {
        Authorization: localStorage.getItem("token") || "",
      },
      signal: abortController.signal,
    };
    console.log(`{${ApiEndPoints.getQuestDetails}?questId=${questId}}`);
    const response: AxiosResponse<UserQuestResponse> = await axios.request(
      axiosConfig
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const useFetchQuestQuery = (questId: string) => {
  return useQuery<UserQuestResponse, Error>({
    queryKey: ["Quests", questId],
    queryFn: () => fetchQuestDetails(questId),
  });
};

const completeQuest = async (questId: string): Promise<{ message: string }> => {
  try {
    const abortController = new AbortController();
    const axiosConfig: AxiosInstanceProps = {
      url: `${ApiEndPoints.completeQuest}${questId}`,
      method: "POST",
      signal: abortController.signal,
      headers: {
        Authorization: localStorage.getItem("token") || "",
      },
    };
    const response: AxiosResponse<{ message: string }> = await axios.request(
      axiosConfig
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const useCompleteQuestMutation = () => {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (questId: string) => completeQuest(questId),
  });
};

export const setQuestData = (questId: string) => {
  return queryClient.setQueryData<UserQuestResponse["data"]>(
    ["Quests", questId],
    (old) => {
      if (!old) return old;
      return {
        ...old,
        isCompleted: true,
      };
    }
  );
};
