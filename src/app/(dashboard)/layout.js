
"use client";
import Sidebar from "../componets/Dashboard/Sidebar/Sidebar";
import "./dashboard.css"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";



export default function DashboardLayout({ children }) {
    const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "admin") {
      router.replace("/forbidden");
    }
  }, [session, status, router]);


  if (status === "loading") {
    return null
  }

  // لو مش admin أو مفيش session متعرضيش الصفحة أصلاً
  if (!session || session.user.role !== "admin") {
    return null;
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "20px" }}>
        {children}
      </main>
    </div>
  );
}