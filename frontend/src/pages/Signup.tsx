import { Link, useNavigate } from "react-router-dom";
import { Eye } from "../components/icons/Eye";
import { AuthState } from "../data/Interface";
import { useState } from "react";
import { toast } from "react-toastify";
import starbucksLogo from "../assets/logo.png";
import sidebarStarbucksLogo from "../assets/sidebar_logo.png";
import heroImage from "../assets/hero_image.jpeg";
import { SignupResponse, useSignupMutation } from "../query/api/auth/signup";
import { Loader } from "../components/Loader";

export const Signup = () => {
  const [signupData, setSignupData] = useState<AuthState>({
    username: "",
    password: "",
    firstname: "",
    lastname: "",
  });
  const [showPassword, setShowPassword] = useState("password");
  const navigate = useNavigate();
  const { mutate: SignupMutate, isPending } = useSignupMutation();

  const onChangeFunction = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData({ ...signupData, [event.target.name]: event.target.value });
  };

  const onSubmitFunction = () => {
    if (signupData.username.trim() === "") {
      toast.error("Username Cannot be null");
      return;
    }
    if (signupData.password.trim() === "") {
      toast.error("Password Cannot be null");
      return;
    }
    if (
      signupData.firstname === undefined ||
      signupData.firstname?.trim() === ""
    ) {
      toast.error("First Name Cannot be null");
      return;
    }
    if (
      signupData.lastname === undefined ||
      signupData.lastname?.trim() === ""
    ) {
      toast.error("Last Name Cannot be null");
      return;
    }
    SignupMutate(signupData, {
      onSuccess: (response: SignupResponse) => {
        toast.success(response.data.message);
        navigate("/login");
      },
      onError: (error: any) => {
        console.error("Signup Error: ", error.message);
        // Handle error response
        toast.error(
          error?.message ||
            error?.response?.data?.errors ||
            error?.response?.data?.message ||
            error?.errors
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
        <div className="font-medium text-lg">Set Up Your Account</div>
        <fieldset className="fieldset md:w-[25vw] mt-4">
          <legend className="fieldset-legend text-gray-700">First Name</legend>
          <div className="border rounded-sm">
            <input
              name="firstname"
              onChange={onChangeFunction}
              type="text"
              className="input focus:outline-none bg-white p-2"
              placeholder="Enter First Name"
            />
          </div>
        </fieldset>
        <fieldset className="fieldset md:w-[25vw]">
          <legend className="fieldset-legend text-gray-700">Last Name</legend>
          <div className="border rounded-sm">
            <input
              name="lastname"
              onChange={onChangeFunction}
              type="text"
              className="input focus:outline-none bg-white p-2"
              placeholder="Enter Last Name"
            />
          </div>
        </fieldset>
        <fieldset className="fieldset md:w-[25vw]">
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
          <legend className="fieldset-legend text-gray-700">
            Set Your Password
          </legend>
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
          <Link to="/login" className="text-blue-500 text-wrap">
            Already have an account?
          </Link>
          <button
            className="group bg-gray-600 text-white py-1 px-2 md:py-2 md:px-4 rounded-4xl hover:text-gray-600 hover:bg-white cursor-pointer"
            onClick={onSubmitFunction}
          >
            {isPending ? (
              <Loader className="text-white group-hover:bg-[#00704A]" />
            ) : (
              "Signup"
            )}
          </button>
        </div>
      </div>
      <div className="absolute w-[80vw] md:w-[30vw] bottom-5 right-10 md:right-5 bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/20">
        <div className="flex items-center gap-2 mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <h3 className="font-semibold text-white">Password Requirements</h3>
        </div>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-200"></div>
            <span className="text-white/80">Minimum 6 characters</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-200"></div>
            <span className="text-white/80">One uppercase letter (A-Z)</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-200"></div>
            <span className="text-white/80">One lowercase letter (a-z)</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-200"></div>
            <span className="text-white/80">One number (0-9)</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-200"></div>
            <span className="text-white/80">
              One special character (@$!%*?&)
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
