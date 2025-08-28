import { useMutation } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { ApiEndPoints } from "../../ApiEndPoints";
import { AxiosInstanceProps } from "../../AxiosInstance";

interface VideoActionResponse {
  message: string;
  success: boolean;
  isChallengeComplete: boolean;
  challengeMessage: string;
}

const toggleVideoShare = async (
  fileName: string,
  challengeId: string | undefined
): Promise<VideoActionResponse> => {
  try {
    if (!fileName || !fileName.trim()) {
      throw new Error("Invalid Video Filename");
    }
    if (!challengeId || !challengeId.trim()) {
      throw new Error("Invalid ChallengeId");
    }
    const axiosConfig: AxiosInstanceProps = {
      method: "POST",
      url: ApiEndPoints.videoShare,
      data: {
        video_filename: fileName,
        challenge_id: challengeId,
      },
      headers: {
        Authorization: localStorage.getItem("token") || "",
      },
    };
    const response: AxiosResponse<VideoActionResponse> = await axios.request(
      axiosConfig
    );
    return response.data;
  } catch (err: any) {
    throw new Error(err);
  }
};

export const useToggleVideoShareMutation = () => {
  return useMutation<
    VideoActionResponse,
    Error,
    { fileName: string; challengeId: string | undefined }
  >({
    mutationFn: ({ fileName, challengeId }) =>
      toggleVideoShare(fileName, challengeId),
  });
};

const toggleVideoLike = async (
  fileName: string,
  challengeId: string | undefined
): Promise<VideoActionResponse> => {
  try {
    if (!fileName || !fileName.trim()) {
      throw new Error("Invalid Video Filename");
    }
    if (!challengeId || !challengeId.trim()) {
      throw new Error("Invalid ChallengeId");
    }
    const axiosConfig: AxiosInstanceProps = {
      method: "POST",
      url: ApiEndPoints.toggleVideoLike,
      data: {
        video_filename: fileName,
        challenge_id: challengeId,
      },
      headers: {
        Authorization: localStorage.getItem("token") || "",
      },
    };
    const response: AxiosResponse<VideoActionResponse> = await axios.request(
      axiosConfig
    );
    return response.data;
  } catch (err: any) {
    throw new Error(err);
  }
};

export const useToggleVideoLikeMutation = () => {
  return useMutation<
    VideoActionResponse,
    Error,
    { fileName: string; challengeId: string | undefined }
  >({
    mutationFn: ({ fileName, challengeId }) =>
      toggleVideoLike(fileName, challengeId),
  });
};
