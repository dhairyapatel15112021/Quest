import { useRecoilValue } from "recoil";
import starbucksLogo from "../assets/logo.png";
import { userAtom } from "../store/atoms/userAtom";
import { Sidebar } from "./icons/Sidebar";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Logout } from "./icons/Logout";
import { User } from "./icons/User";
import { Mobile } from "./icons/Mobile";
import { Wallet } from "./icons/Wallet";
import { Link } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();
  const userData = useRecoilValue(userAtom);

  const HandleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    toast.success("Logout Succesfull");
  };
  useEffect(() => {
    console.log(userData);
  }, [userData]);

  return (
    <div className="h-[10vh] w-screen flex justify-between items-center px-5 pr-8 py-2">
      <img className="w-[80px] h-fit" src={starbucksLogo} alt="logo.png"></img>
      <div className="flex justify-center items-center gap-4">
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="flex justify-center items-center gap-1 cursor-pointer hover:bg-gray-200 rounded-full p-1"
          >
            <div className="w-[35px] h-[35px] rounded-[35px] flex font-bold justify-center items-center border text-white bg-[#00704A] text-xl">
              {userData?.firstname?.charAt(0).toUpperCase()}
            </div>
            <Sidebar />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-white text-black rounded-box z-1 w-fit p-2 shadow-sm"
          >
            <li className="border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-[30px] h-[30px] rounded-[30px] flex font-bold justify-center items-center border text-white bg-[#00704A] text-base">
                  {userData?.firstname?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <div className="font-medium text-black text-sm">
                    {userData?.firstname} {userData?.lastname}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {userData?.username}
                  </div>
                </div>
              </div>
            </li>
            <li className="border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex font-bold justify-center items-center text-black">
                  <Wallet />
                </div>
                <div className="flex items-center gap-1">
                  <div className="text-black text-sm font-normal">
                    {userData?.isAdmin ? "♾️" : userData?.wallet || 0}
                  </div>
                  <div className="text-black text-sm font-normal">Pts</div>
                </div>
              </div>
            </li>
            <li className="mt-1">
              <div
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 w-full h-full"
              >
                <div>
                  <User />
                </div>
                <div>Profile Settings</div>
              </div>
            </li>
            <li className="mt-1">
              <Link
                to="/download"
                target="_blank"
                className="flex items-center gap-2 w-full h-full"
              >
                <div>
                  <Mobile />
                </div>
                <div className="text-nowrap">Download Starbucks App</div>
              </Link>
            </li>
            <li className="mt-1">
              <div
                className="flex items-center gap-2 w-full h-full"
                onClick={HandleLogout}
              >
                <div>
                  <Logout />
                </div>
                <div>Logout</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
