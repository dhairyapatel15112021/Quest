import { useMutation } from '@tanstack/react-query';
import axios, { AxiosResponse } from "axios";
import { AuthState } from "../../../data/Interface";
import { ApiEndPoints } from "../ApiEndPoints";
import { AxiosInstance, AxiosInstanceProps } from "../AxiosInstance";

export type SignupResponse = AxiosResponse<{
    message: string;
}>;

const Signup = async (data : AuthState) : Promise<SignupResponse> => {
    try{
        const abortController = new AbortController();
        const axiosConfig : AxiosInstanceProps = {
            url : ApiEndPoints.signup,
            method: "POST",
            data: data,
            signal: abortController.signal,
        };
        const response = await axios.request(AxiosInstance(axiosConfig));
        return response as SignupResponse;
    }
    catch (err : any) {
        throw new Error(err);
    }
}

export const useSignupMutation = () => {
    return useMutation<SignupResponse, Error, AuthState>({
        mutationFn: Signup,
    });
};