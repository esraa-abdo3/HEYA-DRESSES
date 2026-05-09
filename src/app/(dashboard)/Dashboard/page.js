"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import "../dashboard.css";

export default function Dashboard() {

  const router = useRouter();



  return (
    <div className="home-container">
      <div className="card">
        <h1>👋 Welcome Back</h1>
        <p>You're now inside the admin system dashboard area.</p>

        <button
          onClick={() => router.push("/")}
          className="btn"
        >
          🔙 Return to Website
        </button>
      </div>
    </div>
  );
}