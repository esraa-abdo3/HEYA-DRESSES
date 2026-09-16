"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
const WishlistContext = createContext();

export const WishlistProvider = ({ children, initiallist = {} }) => {
  const [wishlist, setWishlist] = useState(initiallist?.items || []);
  const { data: session } = useSession();

  const fetchWishlist = async () => {
    try {
      const guestId = typeof window !== "undefined" ? localStorage.getItem("guestId") : null;
      const guestParam = !session?.user && guestId ? `?guestId=${guestId}` : "";

      if (session?.user || guestId) {
        const res = await fetch(`/api/Wishlist${guestParam}`);
        const data = await res.json();
        if (data?.items) {
          setWishlist(data.items);
        }
      }
    } catch (err) {
      console.log("Error fetching wishlist:", err);
    }
  };

  useEffect(() => {
    let guestId = typeof window !== "undefined" ? localStorage.getItem("guestId") : null;

    if (!session?.user) {
      if (!guestId && typeof window !== "undefined") {
        guestId = crypto.randomUUID();
        localStorage.setItem("guestId", guestId);
      }
    }

    fetchWishlist();
  }, [session]);

  const toggleWishlist = async (product) => {
    if (!product || !product._id) return;

    const productId = product._id;
    const exist = wishlist.some((item) => item._id === productId);

    let updatedList;
    if (exist) {
      updatedList = wishlist.filter((e) => e._id !== productId);
    } else {
      updatedList = [...wishlist, product];
    }
    setWishlist(updatedList);

    let guestId = typeof window !== "undefined" ? localStorage.getItem("guestId") : null;
    if (!session?.user && !guestId && typeof window !== "undefined") {
      guestId = crypto.randomUUID();
      localStorage.setItem("guestId", guestId);
    }

    const payload = { productId };
    if (!session?.user && guestId) {
      payload.guestId = guestId;
    }

    try {
      if (exist) {
        await fetch("/api/Wishlist", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/Wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }
    } catch (error) {
      console.log("wishlist error:", error);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, setWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
