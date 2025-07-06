import { Header } from "../components/Header";
import { Outlet } from "react-router-dom";

export const Home = () => {
  return (
    <div className="bg-[#f8f7f3]">
      <Header />
      <Outlet />
    </div>
  );
};
