import { Header } from "../components/Header";
import { Outlet } from "react-router-dom";

export const Home = () => {
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
};
