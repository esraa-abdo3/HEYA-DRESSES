"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import "./Sidebar.css";

import {
  FaHome,
  FaUsers,
  FaBoxOpen,
  FaShoppingCart,
  FaTags,
  FaPercent,
  FaBars,
  FaTimes,
  FaStore,
  FaSignOutAlt,
  FaCrown,
} from "react-icons/fa";

import { useState } from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { label: "Overview", href: "/Dashboard", icon: FaHome },
    { label: "Bookings", href: "/Dashboard/Bookings", icon: FaShoppingCart },
    { label: "Products", href: "/Dashboard/Products", icon: FaBoxOpen },
    { label: "Categories", href: "/Dashboard/catagories", icon: FaTags },
    { label: "Users", href: "/Dashboard/Users", icon: FaUsers },
    { label: "Promo Codes", href: "/Dashboard/promocodes", icon: FaPercent },
  ];

  return (
    <>
      <button 
        className="menuIcon" 
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation menu"
      >
        {open ? <FaTimes /> : <FaBars />}
      </button>

      <aside className={`sidebar ${open ? "showSidebar" : ""}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-icon">
            <FaCrown />
          </div>
          <div className="brand-text">
            <h2>HEYA STORE</h2>
            <span className="brand-badge">ADMIN CONTROL</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">NAVIGATION MENU</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/Dashboard"
                ? pathname === "/Dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <Icon className="nav-icon" />
                <span>{item.label}</span>
                {isActive && <div className="active-pill" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer Admin Info */}
        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="admin-avatar">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="admin-details">
              <span className="admin-name">{session?.user?.name || "Administrator"}</span>
              <span className="admin-email">{session?.user?.email || "admin@heya.com"}</span>
            </div>
          </div>

          <div className="sidebar-footer-actions">
            <Link href="/" className="footer-action-btn" title="View Store">
              <FaStore />
              <span>Storefront</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/Auth/login" })}
              className="footer-action-btn logout-btn"
              title="Logout"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="overlay"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}