export interface AxiosInstanceProps {
    baseURL?: string;
    timeout?: number;
    headers?: Record<string, string>;
    method : string;
    data?: any;
    params?: Record<string, any>;
    signal?: AbortSignal;
    url : string
}

export const AxiosInstance =  (data : AxiosInstanceProps) => {
    const axiosConfig: AxiosInstanceProps = {
        baseURL: data.baseURL,
        url: data.url,
        timeout: data.timeout || 10000,
        headers: {
            "Content-Type": "application/json",
            ...data.headers
        },
        method: data.method,
        data: data.data,
        params: data.params,
        signal: data.signal
    };

    return axiosConfig;
}