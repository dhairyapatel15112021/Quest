import axios from "axios";
import { AuthState } from "../../../data/Interface";
import { AxiosInstance, AxiosInstanceProps } from "../AxiosInstance";
import { useMutation } from '@tanstack/react-query';
import { ApiEndPoints } from "../ApiEndPoints";

export interface loginRequestResponse {
    username: string,
    is_admin: boolean,
    token: string,
    id: string,
    role: string,
    firstname?: string,
    lastname?: string,
    wallet?: number
}

const login = async (data: AuthState): Promise<loginRequestResponse> => {
    try {
        const abortController = new AbortController();
        const axiosConfig : AxiosInstanceProps = {
            baseURL: import.meta.env.VITE_API_BASE_URL, // Make sure this env variable is set
            url: ApiEndPoints.login,
            method: "POST",
            data: data,
            signal: abortController.signal,
        };
        const response = await axios.request(AxiosInstance(axiosConfig));
        return response.data as loginRequestResponse;
    } catch (err: any) {
        throw new Error(err);
    }
};

// TanStack Query useMutation hook for login

export const useLoginMutation = () => {
    return useMutation<loginRequestResponse, Error, AuthState>({
        mutationFn: login,
    });
};

