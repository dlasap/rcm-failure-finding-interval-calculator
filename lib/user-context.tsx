"use client";

import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(undefined);
  const [userPlans, setUserPlans] = useState(undefined);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const storedUserPlans = localStorage.getItem("userPlans");
    if (storedUserPlans) {
      setUserPlans(JSON.parse(storedUserPlans));
    }
  }, []);

  return <UserContext.Provider value={{ user, setUser, userPlans, setUserPlans }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
