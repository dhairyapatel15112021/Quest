import { toast } from "react-toastify";
import { Eye } from "../components/icons/Eye";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AuthState } from "../data/Interface";
import { useSetRecoilState } from "recoil";
import { userAtom } from "../store/atoms/userAtom";
import starbucksLogo from "../assets/logo.png";
import sidebarStarbucksLogo from "../assets/sidebar_logo.png";
import heroImage from "../assets/hero_image.jpeg";
import {
  loginRequestResponse,
  useLoginMutation,
} from "../query/api/auth/login";
import { Loader } from "../components/Loader";

export const Login = () => {
  const [loginData, setLoginData] = useState<AuthState>({
    username: "",
    password: "",
  });
  const setUserData = useSetRecoilState(userAtom);
  const [showPassword, setShowPassword] = useState("password");
  const navigate = useNavigate();
  const { mutate: loginMutation, isPending } = useLoginMutation();

  const onChangeFunction = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [event.target.name]: event.target.value });
  };

  const onSubmitFunction = async () => {
    if (loginData.username.trim() === "") {
      toast.error("Username Cannot be null");
      return;
    }
    if (loginData.password.trim() === "") {
      toast.error("Password Cannot be null");
      return;
    }
    loginMutation(loginData, {
      onSuccess: (data: loginRequestResponse) => {
        // Login successful, user data is set in the useLoginMutation hook
        setUserData({
          username: data.username,
          id: data.id,
          isAdmin: data.is_admin,
          firstname: data.firstname,
          lastname: data.lastname,
          wallet: data.wallet,
        });
        localStorage.setItem("token", `Bearer ${data.token}`);
        toast.success("Login Successfully");
        data.is_admin
          ? navigate("/admin/dashboard")
          : navigate("/user/dashboard/quests");
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.errors ||
            error?.response?.data?.message ||
            error?.errors ||
            error?.message
        );
      },
    });
  };

  const toggleShowPassword = () => {
    setShowPassword(showPassword === "password" ? "text" : "password");
  };

  return (
    <div
      className="w-screen h-screen flex justify-center items-center bg-cover bg-right"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <img
        className="absolute top-[2vh] left-0 w-[80px] h-fit"
        src={starbucksLogo}
        alt="logo.png"
      ></img>
      <img
        src={sidebarStarbucksLogo}
        className="absolute top-[75vh] md:top-[60vh] -left-[5vw] -rotate-90 md:-left-[5.5vw] h-[10vh] md:h-[30vh]"
        alt="sidebar_logo.png"
      />
      <div className="bg-white px-10 py-5 text-gray-700 rounded-md">
        <div className="font-medium text-lg">Log Into Your Account</div>
        <fieldset className="fieldset md:w-[25vw] mt-4">
          <legend className="fieldset-legend text-gray-700">
            Email Address
          </legend>
          <div className="border rounded-sm">
            <input
              name="username"
              onChange={onChangeFunction}
              type="text"
              className="input focus:outline-none bg-white p-2"
              placeholder="Enter Username"
            />
          </div>
        </fieldset>
        <fieldset className="fieldset md:w-[25vw]">
          <legend className="fieldset-legend text-gray-700">Password</legend>
          <div className="flex border justify-center items-center rounded-sm">
            <input
              name="password"
              onChange={onChangeFunction}
              type={showPassword}
              className="input focus:outline-none bg-white p-2 md:p-0"
              placeholder="Enter Password"
            />
            <Eye className="cursor-pointer" onClick={toggleShowPassword} />
          </div>
        </fieldset>
        <div className="flex justify-between items-center mt-5 text-sm">
          <Link to="/signup" className="text-blue-500">
            Don't Have Account?
          </Link>
          <button
            className="group bg-gray-600 text-white py-1 px-2 md:py-2 md:px-4 rounded-4xl hover:text-gray-600 hover:bg-white cursor-pointer"
            onClick={onSubmitFunction}
          >
            {isPending ? (
              <Loader className="text-white group-hover:bg-[#00704A]" />
            ) : (
              "Login"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
