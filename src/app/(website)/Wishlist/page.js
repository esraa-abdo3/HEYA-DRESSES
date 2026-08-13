"use client";

import { useCart } from "../../Context/cartcontext";
import Link from "next/link";
import "./wishlist.css";
import { useWishlist } from "@/app/Context/WishlistContext";

export default function CartPage() {
  const { addToCart, cartError } = useCart();

  const { wishlist, toggleWishlist, totalPages, currentPage, changePage  } = useWishlist();

  const todayISO = new Date().toISOString().slice(0, 10);
  const getUpcomingBookedDays = (product) => {
    const now = new Date();
    return (product?.bookedDates || [])
      .map((d) => new Date(d))
      .filter(
        (d) =>
          d.toISOString().slice(0, 10) >= todayISO &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
      )
      .sort((a, b) => a - b)
      .map((d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
  };


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
  {wishlist.map((item) => {
    const stock = item.stock;
    const isOut = stock === 0;
    const isLow = stock > 0 && stock <= 5;

    return (
      <div className="cart-item" key={item._id}>
        
      
        <img
          src={item.images[0]}
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

          {/* {isLow && (
            <p className="stock-low">Low Stock ⚠️</p>
          )} */}

          {/* {getUpcomingBookedDays(item).length > 0 && (
            <p className="booked-days-hint">
              Booked this month on: {getUpcomingBookedDays(item).join(", ")}
            </p>
          )} */}
          {/* { !isOut && 
              <button
            className="Add-to-card-button"
            disabled={isOut}
            onClick={() => addToCart(item)}
          >
         Add to cart
          </button>
} */}
        {/* {cartError[item._id] && (
            <p className="error"style={{color:"red" , fontSize:"14px"}}>{cartError[item._id]}which in the cart</p>
          )}     */}
    
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