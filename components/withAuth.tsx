"use client";

import { useUser } from "@/lib/user-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();
    const { user, userPlans } = useUser();

    useEffect(() => {
      if (!user || !userPlans) {
        router.replace("/");
      }
    }, [user, router]);

    if (!user) {
      return null; // Prevent rendering until redirect
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
