import { useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { ApiEndPoints } from "../../ApiEndPoints";
import { AxiosInstanceProps } from "../../AxiosInstance";
import { queryClient } from "../../../../App";

interface VideoStatsResponse {
  data: {
    totalLikes: number;
    totalShares: number;
  };
}

interface VideoStatusResponse {
  data: {
    is_liked: boolean;
    is_shared: boolean;
  };
}

interface UserProgressData {
  requirements: {
    like_video_count: number;
    share_video_count: number;
  };
  progress: {
    likedVideos: number;
    sharedVideos: number;
  };
}

interface UserProgressResponse {
  success: boolean;
  data: UserProgressData;
}

const fetchStats = async (
  fileName: string
): Promise<VideoStatsResponse["data"]> => {
  try {
    if (!fileName || !fileName.trim()) {
      throw new Error("Invalid Video Filename");
    }
    const abortController = new AbortController();
    const axiosConfig: AxiosInstanceProps = {
      method: "GET",
      url: `${ApiEndPoints.getVideoStats}?video_filename=${fileName}`,
      signal: abortController.signal,
      headers: {
        Authorization: localStorage.getItem("token") || "",
      },
    };
    const response: AxiosResponse<VideoStatsResponse> = await axios.request(
      axiosConfig
    );
    return response.data.data;
  } catch (err: any) {
    throw new Error(err);
  }
};

export const useFetchStatsQuery = (fileName: string, videoIndex: number) => {
  return useQuery<VideoStatsResponse["data"], Error>({
    queryFn: () => fetchStats(fileName),
    queryKey: ["Stats", fileName, videoIndex],
  });
};

const fetchStatus = async (
  fileName: string,
  challengeId: string | undefined
): Promise<VideoStatusResponse["data"]> => {
  try {
    if (!fileName || !fileName.trim()) {
      throw new Error("Invalid Video Filename");
    }
    if (!challengeId || !challengeId.trim()) {
      throw new Error("Invalid ChallengeId");
    }
    const abortController = new AbortController();
    const axiosConfig: AxiosInstanceProps = {
      method: "GET",
      url: `${ApiEndPoints.getUserVideoStatus}?video_filename=${fileName}&challenge_id=${challengeId}`,
      signal: abortController.signal,
      headers: {
        Authorization: localStorage.getItem("token") || "",
      },
    };
    const response: AxiosResponse<VideoStatusResponse> = await axios.request(
      axiosConfig
    );
    return response.data.data;
  } catch (err: any) {
    throw new Error(err);
  }
};

export const useFetchStatusQuery = (
  fileName: string,
  challengeId: string | undefined,
  videoIndex: number
) => {
  return useQuery<VideoStatusResponse["data"], Error>({
    queryKey: ["Status", fileName, challengeId, videoIndex],
    queryFn: () => fetchStatus(fileName, challengeId),
  });
};

export const updateStatsData = (
  isShared: boolean,
  fileName: string,
  videoIndex: number,
  isLiked: boolean = false
) => {
  return queryClient.setQueryData<VideoStatsResponse["data"]>(
    ["Stats", fileName, videoIndex],
    (old) => {
      if (!old) return old;
      if (isShared) {
        return {
          ...old,
          totalShares: old.totalShares + 1,
        };
      } else {
        return {
          ...old,
          totalLikes: isLiked ? old.totalLikes + 1 : old.totalLikes - 1,
        };
      }
    }
  );
};

export const updateStatusData = (
  isShared: boolean,
  fileName: string,
  videoIndex: number,
  challengeId: string | undefined
) => {
  return queryClient.setQueryData<VideoStatusResponse["data"]>(
    ["Status", fileName, challengeId, videoIndex],
    (old) => {
      if (!old) return old;
      if (isShared) {
        return {
          ...old,
          is_shared: !old.is_shared,
        };
      } else {
        return {
          ...old,
          is_liked: !old.is_liked,
        };
      }
    }
  );
};

const fetchUserProgress = async (
  challengeId: string | undefined
): Promise<UserProgressResponse> => {
  try {
    const abortController = new AbortController();
    const axiosConfig: AxiosInstanceProps = {
      method: "GET",
      url: `${ApiEndPoints.getChallengeProgress}${challengeId}`,
      signal: abortController.signal,
      headers: {
        Authorization: localStorage.getItem("token") || "",
      },
    };
    const response: AxiosResponse<UserProgressResponse> = await axios.request(
      axiosConfig
    );
    return response.data;
  } catch (err: any) {
    throw new Error(err);
  }
};

export const useFetchUserProgressQuery = (challengeId: string | undefined) => {
  return useQuery<UserProgressResponse, Error>({
    queryKey: ["UserProgress", challengeId],
    queryFn: () => fetchUserProgress(challengeId),
  });
};

export const updateUserProgressData = (
  challengeId: string | undefined,
  isShared: boolean
) => {
  return queryClient.setQueryData<UserProgressResponse>(
    ["UserProgress", challengeId],
    (old) => {
      if (!old) return old; // if no previous data, do nothing

      const { data } = old;

      // If the video is shared, increment sharedVideos
      if (isShared) {
        return {
          ...old,
          data: {
            ...data,
            progress: {
              ...data.progress,
              sharedVideos: data.progress.sharedVideos + 1, // increment sharedVideos
            },
          },
        };
      }

      // If it's not shared, we assume it's a like action (increment likedVideos)
      return {
        ...old,
        data: {
          ...data,
          progress: {
            ...data.progress,
            likedVideos: data.progress.likedVideos + 1, // increment likedVideos
          },
        },
      };
    }
  );
};
