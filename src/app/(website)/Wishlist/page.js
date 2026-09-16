"use client";

import { useState, useEffect } from "react";
import { useCart } from "../../Context/cartcontext";
import Link from "next/link";
import "./wishlist.css";
import { useWishlist } from "@/app/Context/WishlistContext";

export default function WishlistPage() {
  const { addToCart, cartError } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  const totalPages = Math.ceil(wishlist.length / ITEMS_PER_PAGE) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [wishlist.length, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = wishlist.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="cart-page wishlist">
      <h1 className="title"> My Wishlist</h1>

      {wishlist.length === 0 ? (
        <div className="empty">
          <h2>Your wishlist is waiting</h2>
          <p>Add your favorite items and find them here anytime</p>
          <Link href="/">
            <button className="btn-shop">Go to Products</button>
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-grid">
            {currentItems.map((item) => {
              const stock = item.stock;
              const isOut = stock === 0;

              return (
                <div className="cart-item" key={item._id}>
                  <img
                    src={item.images?.[0]}
                    alt={item.name}
                    className="product-img"
                  />

                  <div className="info">
                    <h3>{item.name}</h3>

                    <p className="desc">
                      {item.description?.slice(0, 60)}...
                    </p>

                    <div className="price-row">
                      <span>price : </span>
                      <span className="price-current">
                        {item.priceAfterDiscount ?? item.price} LE
                      </span>
                      {item.priceAfterDiscount && (
                        <span className="price-original">{item.price} LE</span>
                      )}
                      {item.priceAfterDiscount && (
                        <span className="price-discount-badge">
                          -{Math.round(100 - (item.priceAfterDiscount / item.price) * 100)}%
                        </span>
                      )}
                    </div>

                    {isOut && (
                      <p className="stock-out">Out of Stock 🚫</p>
                    )}
                  </div>

                  <button
                    className="remove"
                    onClick={() => toggleWishlist(item)}
                  >
                    🗑
                  </button>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={currentPage === i + 1 ? "active" : ""}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}