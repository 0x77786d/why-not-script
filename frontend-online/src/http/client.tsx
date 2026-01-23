import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { I_PORT } from "./interface";

export type Response<T> = {
    success: boolean;
    msg: string;
    errorCode: number;
    data: T;
};

export type RequestOptions = AxiosRequestConfig;

const createClient = (): AxiosInstance => {
    const instance = axios.create({
        baseURL: `http://localhost:${I_PORT}`,
        timeout: 15000,
        withCredentials: false,
    });

    return instance;
};

const Client = createClient();

const client = {
    request: async <T = unknown,>(
        url: string,
        data?: any,
        config?: RequestOptions
    ): Promise<Response<T>> => {
        const response = await Client.post<Response<T>>(url, data, config);
        return response.data;
    },
};

export default client;
