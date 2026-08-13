"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
const WishlistContext = createContext();

export const WishlistProvider = ({ children, initiallist = [] }) => {

  const [totalPages, settotalpage] = useState(initiallist.totalPages);
  const [currentPage, setcurrentPage] = useState(initiallist.currentPage);
  const [wishlist, setWishlist] = useState(initiallist.items);
  const { data: session } = useSession();

  useEffect(() => {
    const guestId = localStorage.getItem("guestId");

    if (!session?.user && guestId) {
      fetch(`/api/Wishlist?guestId=${guestId}`)
        .then((res) => res.json())
        .then((data) => setWishlist(data.items || []))
        .catch((err) => console.log(err));
    }
  }, []);

  const changePage = async (page) => {
    setcurrentPage(page);

    try {
      const guestId = localStorage.getItem("guestId");
      const guestParam = !session?.user && guestId ? `&guestId=${guestId}` : "";
      const res = await fetch(`/api/Wishlist?page=${page}&limit=3${guestParam}`);
      const data = await res.json();

      setWishlist(data.items);
    } catch (err) {
      console.log(err);
    }
  };

  const toggleWishlist = async (product) => {
    const productId = product._id;
    const exist = wishlist.some((item) => item._id === productId);

    if (exist) {
      setWishlist((prev) => prev.filter((e) => e._id !== productId));
    } else {
      setWishlist((prev) => [...prev, product]);
    }

    const guestId = localStorage.getItem("guestId");
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
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, totalPages, currentPage, changePage, setWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
