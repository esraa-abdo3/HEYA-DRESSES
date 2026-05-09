"use client";

import Link from "next/link";
import "./Sidebar.css";

import {
  FaHome,
  FaUsers,
  FaBoxOpen,
  FaShoppingCart,
  FaTags,
  FaPercent,
  FaBars,
} from "react-icons/fa";

import { useState } from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="menuIcon" onClick={() => setOpen(!open)}>
        <FaBars />
      </div>

      <div className={`sidebar ${open ? "showSidebar" : ""}`}>

        <div className="logo">
          <h2>HEYA STORE</h2>
        </div>

        <nav>

          <Link href="/Dashboard">
            <FaHome />
            <span>Home</span>
          </Link>

          <Link href="/Dashboard/Users">
            <FaUsers />
            <span>Users</span>
          </Link>

          <Link href="/Dashboard/Products">
            <FaBoxOpen />
            <span>Products</span>
          </Link>

          {/* <Link href="/Dashboard/orders">
            <FaShoppingCart />
            <span>Orders</span>
          </Link> */}

          <Link href="/Dashboard/catagories">
            <FaTags />
            <span>Categories</span>
          </Link>

          <Link href="/Dashboard/promocodes">
            <FaPercent />
            <span>Promo Codes</span>
          </Link>

        </nav>

      </div>

      {open && (
        <div
          className="overlay"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}