import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { userAtom } from "../store/atoms/userAtom";
import { ApiEndPoints } from "../query/api/ApiEndPoints";

interface Props {
  setIsChecked: (value: boolean) => void;
}

interface refreshResponse {
  is_admin: boolean;
  username: string;
  firstname: string;
  lastname: string;
  id: string;
  wallet: number;
}

export const UseAuthCheck: React.FC<Props> = ({ setIsChecked }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const setUserData = useSetRecoilState(userAtom);
  const validateUser = async () => {
    try {
      setIsChecked(false);
      const abortController = new AbortController();
      const axiosConfig: AxiosRequestConfig = {
        url: ApiEndPoints.refresh,
        method: "POST",
        headers: {
          Authorization: localStorage.getItem("token"),
        },
        signal: abortController.signal,
      };
      const response: AxiosResponse = await axios(axiosConfig);
      const data: refreshResponse = response.data;
      setUserData({
        username: data.username,
        id: data.id,
        isAdmin: data.is_admin,
        firstname: data.firstname,
        lastname: data.lastname,
        wallet: data.wallet,
      });
    } catch (err: any) {
      localStorage.removeItem("token");
      if (location.pathname === "/signup") {
        navigate("/signup");
        return;
      }
      navigate("/login");
    } finally {
      setIsChecked(true);
    }
  };

  useEffect(() => {
    validateUser();
  }, []);

  return null;
};
