import { useMutation } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { QuestState } from "../../../data/Interface";
import { ApiEndPoints } from "../ApiEndPoints";
import { AxiosInstanceProps } from "../AxiosInstance";

export type QuestCreateResponse = AxiosResponse<{
  message: string;
  quest: QuestState;
}>;

async function questCreate(
  data: QuestState,
  alwaysOn: boolean,
  isQuestCreation: boolean
): Promise<QuestCreateResponse> {
  try {
    const imageBlob = new Blob([data.quest_image], { type: "image/png" });

    const formData = new FormData();
    formData.append("Title", data.Title);
    formData.append("Description", data.Description);
    formData.append("total_budget", data.total_budget.toString());
    formData.append("start_date", data.start_date.toISOString());
    formData.append("end_date", alwaysOn ? "" : data.end_date.toISOString());
    formData.append("quest_image", imageBlob, "quest_image.png");

    const abortController = new AbortController();
    const axiosConfig: AxiosInstanceProps = {
      url: isQuestCreation
        ? ApiEndPoints.createQuest
        : `${ApiEndPoints.updateQuest}${data.id}`,
      method: isQuestCreation ? "POST" : "PUT",
      data: formData,
      signal: abortController.signal,
      headers: {
        Authorization: localStorage.getItem("token") || "",
        "Content-Type": "multipart/form-data",
      },
    };
    const response: QuestCreateResponse = await axios.request(axiosConfig);
    return response;
  } catch (err: any) {
    throw new Error(err);
  }
}

export function useQuestMutation() {
  return useMutation<
    QuestCreateResponse,
    Error,
    { data: QuestState; alwaysOn: boolean; isQuestCreation: boolean }
  >({
    mutationFn: ({ data, alwaysOn, isQuestCreation }) =>
      questCreate(data, alwaysOn, isQuestCreation),
  });
}

async function questToggle(id: string) {
  try {
    const abortController = new AbortController();
    const axiosConfig: AxiosInstanceProps = {
      method: "PUT",
      url: ApiEndPoints.toggleQuestActiveStatus + id,
      signal: abortController.signal,
      headers: {
        Authorization: localStorage.getItem("token") || "",
      },
    };
    const response = await axios.request(axiosConfig);
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message);
  }
}

export function useQuestToggleMutation() {
  return useMutation<{ message: string; quest: QuestState }, Error, string>({
    mutationFn: (id) => questToggle(id),
  });
}
