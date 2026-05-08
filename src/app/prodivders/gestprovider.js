"use client";

import { useEffect } from "react";

export default function GuestInit({ isGuest }) {
  useEffect(() => {
    if (!isGuest) return;

    let guestId = localStorage.getItem("guestId");

    if (!guestId) {
      guestId = crypto.randomUUID();
      localStorage.setItem("guestId", guestId);
    }
  }, [isGuest]);

  return null;
}