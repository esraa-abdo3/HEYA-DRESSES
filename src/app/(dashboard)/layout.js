"use client";

import Sidebar from "../componets/Dashboard/Sidebar/Sidebar";
import "./dashboard.css";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { FaStore, FaUserShield, FaBell } from "react-icons/fa";

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "admin") {
      router.replace("/forbidden");
    }
  }, [session, status, router]);

  const getPageTitle = (path) => {
    if (path.includes("/Bookings")) return "Bookings Management";
    if (path.includes("/Products")) return "Products Management";
    if (path.includes("/Users")) return "Users & Roles";
    if (path.includes("/catagories")) return "Categories Management";
    if (path.includes("/promocodes")) return "Promo Codes";
    return "Overview Dashboard";
  };

  if (status === "loading") {
    return (
      <div className="dashboard-root" style={{ alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner-md" style={{ margin: "0 auto 16px auto" }} />
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return (
    <div className="dashboard-root">
      <Sidebar />
      <div className="dashboard-main-content">
        <header className="dashboard-header">
          <div className="header-left">
            <div className="header-title-container">
              <h1>{getPageTitle(pathname)}</h1>
              <p>HEYA DRESSES Admin Control Panel</p>
            </div>
          </div>

          <div className="header-right">
            <Link href="/" className="store-link-btn" target="_blank">
              <FaStore />
              <span>View Storefront</span>
            </Link>

            <div className="user-badge">
              <div className="user-avatar">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="user-info">
                <span className="user-name">{session?.user?.name || "Admin"}</span>
                <span className="user-role">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}