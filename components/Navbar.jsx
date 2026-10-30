
"use client";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { logoutAdmin } from "@/redux/features/authSlice";
import { Menu, LogOut, UserCircle } from "lucide-react";

export default function Navbar({ onMenuClick }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const { admin } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutAdmin()).unwrap();
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>

        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Admin Panel
          </h2>
          <p className="hidden text-xs text-slate-400 sm:block">
            Manage your medical system
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="flex items-center gap-2">
          <UserCircle size={30} className="text-blue-600" />

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">
              {admin?.name || "Administrator"}
            </p>
            <p className="text-xs text-slate-500">
              {admin?.email || "Admin"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
        >
          <LogOut size={17} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
