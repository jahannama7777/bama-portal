"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getSessionAction, logoutAction } from "../app/actions/authActions";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSessionAction().then((session) => {
      setUser(session);
      setLoading(false);
    });
  }, []);

  const logout = async () => {
    await logoutAction();
    setUser(null);
  };

  const isAdmin = user?.role === "SUPERADMIN" || user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAdmin,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isUserManagementOpen,
        setIsUserManagementOpen,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
