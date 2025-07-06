import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { ApiEndPoints } from "../ApiEndPoints";
import { AxiosInstanceProps } from "../AxiosInstance";

export interface DashboardData {
    success: boolean,
    quests: Array<{
        _id: string,
        Title: string,
        Description: string,
        start_date: Date,
        end_date: Date,
        total_budget: number,
        is_Active: string,
        quest_image: string,
        analytics: {
            totalParticipants: number,
            totalLikedVideos: number,
            totalSharedVideos: number,
            totalRewardsDistributed: number,
            isActive: boolean
        }
    }>,
    overallStats: {
        totalActiveQuests: number,
        totalParticipants: number,
        totalLikedVideos: number,
        totalSharedVideos: number,
        totalRewardsDistributed: number
    }
}

const getQuests = async () : Promise<DashboardData> => {
    try {
        const abortController = new AbortController();
        const axiosConfig : AxiosInstanceProps  = {
            url : ApiEndPoints.getAllQuests,
            method : "GET",
            signal : abortController.signal,
            headers : {
                Authorization : localStorage.getItem("token") || ""
            }
        };
        const response = await axios.request(axiosConfig);
        return response.data;
    }
    catch (err){
        throw new Error(err instanceof Error ? err.message : "An error occurred while fetching quests");
    }
}

export const useQuestsQuery = () => {
    return useQuery<DashboardData, Error>({
        queryKey: ['quests'],
        queryFn: getQuests,
        refetchOnWindowFocus: true,
    });
}