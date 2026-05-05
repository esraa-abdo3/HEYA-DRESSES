"use client";

import { useCart } from "../Context/cartcontext";
import Link from "next/link";
import "./wishlist.css";
import { useWishlist } from "@/app/Context/WishlistContext";

export default function CartPage() {
  const { addToCart  } = useCart();

  const { wishlist, toggleWishlist, totalPages, currentPage, changePage  } = useWishlist();


  return (
    <div className="cart-page">
      <h1 className="title"> My Wishlist</h1>

      {wishlist.length === 0 ? (
        <div className="empty">
      <h2>Your wishlist is waiting</h2>
<p>Add your favorite items and find them here anytime</p>
          <Link href="/products">
            <button className="btn-shop">Go to Products</button>
          </Link>
        </div>
      ) : (
        <>
       <div className="cart-grid">
  {wishlist.map((item) => {
    const stock = item.stock;
    const isOut = stock === 0;
    const isLow = stock > 0 && stock <= 5;

    return (
      <div className="cart-item" key={item._id}>
        
      
        <img
          src={item.image}
          alt={item.name}
          className="product-img"
        />

      
        <div className="info">
          <h3>{item.name}</h3>

          <p className="desc">
            {item.description?.slice(0, 60)}...
          </p>

          <p className="price">
            ${item.price}
          </p>

          {isOut && (
            <p className="stock-out">Out of Stock 🚫</p>
          )}

          {isLow && (
            <p className="stock-low">Low Stock ⚠️</p>
          )}

          <button
            className="Add-to-card-button"
            disabled={isOut}
            onClick={() => addToCart(item)}
          >
            {isOut ? "Not Available" : "Add to cart"}
          </button>
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
        onClick={() => changePage(i + 1)}
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