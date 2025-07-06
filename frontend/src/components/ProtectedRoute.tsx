import React, { useEffect, useState } from "react";
import { Loader } from "./Loader";
import { Unauthorised } from "./Unauthorised";
import { useRecoilValue } from "recoil";
import { userAtom } from "../store/atoms/userAtom";

interface routeData {
  roles: string[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<routeData> = ({ roles, children }) => {
  const userData = useRecoilValue(userAtom);
  const [isLoading, setLoading] = useState(true);
  const [isAuthorised, setAuthorised] = useState(false);

  useEffect(() => {
    const Roles: string[] = import.meta.env.VITE_ROLES?.split(",") || [];
    for (let i = 0; i < roles.length; i++) {
      if (
        (roles[i] === Roles[0] && userData?.isAdmin) ||
        (roles[i] === Roles[1] && !userData?.isAdmin)
      ) {
        setLoading(false);
        setAuthorised(true);
        return;
      }
    }
    setLoading(false);
    setAuthorised(false);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  if (!isLoading && !isAuthorised) {
    return <Unauthorised />;
  }

  return <>{children}</>;
};
