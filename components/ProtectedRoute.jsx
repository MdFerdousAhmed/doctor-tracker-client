
"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { getCurrentAdmin } from "@/redux/features/authSlice";

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const { admin, isAuthenticated, loading, initialized } =
    useSelector((state) => state.auth);

  useEffect(() => {
    if (!initialized) {
      dispatch(getCurrentAdmin());
    }
  }, [dispatch, initialized]);

  useEffect(() => {
    if (initialized && !loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [initialized, loading, isAuthenticated, router]);

  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">
          Checking authentication...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !admin) {
    return null;
  }

  return children;
}
