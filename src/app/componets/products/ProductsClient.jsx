"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import "./products.css";
import { FaHeart, FaEye, FaCalendarAlt, FaTimes } from "react-icons/fa";
import { useWishlist } from "@/app/Context/WishlistContext";
import { useSelectedProduct } from "../../Context/SelectedProductContext";
import AvailabilityCalendar from "../AvailabilityCalendar/AvailabilityCalendar";
import Link from "next/link";

export default function Getproducts({ products }) {
  const [category, setCategory] = useState("all");
  const [calendarModalProduct, setCalendarModalProduct] = useState(null);
  const { toggleWishlist, wishlist } = useWishlist();
  const { setSelectedProduct } = useSelectedProduct();
  const router = useRouter();

  // ---- See More state ----
  const itemsPerPage = 10;
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);
  const seeMoreRef = useRef(null);

  const filteredProducts =
    category === "all" ? products : products.filter((p) => p.category?.name === category);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setVisibleCount(itemsPerPage);
  };

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleSeeMore = useCallback(() => {
    setVisibleCount((prev) => prev + itemsPerPage);
  }, []);

  // ---- Auto-load بعد ثانيتين لما الزرار يبقى ظاهر ----
  useEffect(() => {
    if (!hasMore || !seeMoreRef.current) return;

    let timer = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // بدأ يظهر في الشاشة -> استنى ثانيتين وبعدين حمّل
          timer = setTimeout(() => {
            handleSeeMore();
          }, 400);
        } else {
          // اختفى قبل ما الثانيتين يخلصوا -> إلغي المؤقت
          if (timer) clearTimeout(timer);
        }
      },
      { threshold: 0.3 } // يعتبر "ظاهر" لما 30% منه يبان
    );

    observer.observe(seeMoreRef.current);

    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [hasMore, handleSeeMore, visibleCount]);

  return (
    <div className="products">
      <div className="container">
        <div className="filters">
          <p className={category === "all" ? "active" : ""} onClick={() => handleCategoryChange("all")}>all</p>
          <p className={category === "dresses" ? "active" : ""} onClick={() => handleCategoryChange("dresses")}>dresses</p>
          <p className={category === "Bags" ? "active" : ""} onClick={() => handleCategoryChange("Bags")}>bags</p>
        </div>

        <div className="cards">
          {filteredProducts.length === 0 && (
            <p style={{ textTransform: "uppercase", margin: "30px 0" }}>no products found for this catagory</p>
          )}

          {visibleProducts.map((item, index) => {
            const isNewlyLoaded = index >= visibleCount - itemsPerPage;

            return (
              <div
                key={item._id}
                className={`item ${isNewlyLoaded ? "item-animate" : ""}`}
                style={{ animationDelay: isNewlyLoaded ? `${(index % itemsPerPage) * 0.06}s` : "0s" }}
              >
                <div
                  style={{
                    backgroundImage: `url(${item.images?.[0] || ""})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  className="image"
                >
                  <div
                    style={{ color: wishlist.some((e) => e._id === item._id) ? "red" : "white" }}
                    className="icon-wishlist"
                    onClick={() => toggleWishlist(item)}
                  >
                    <FaHeart />
                  </div>

                  {item.isNew && <div className="isnew">New</div>}

                  <div className="hover-overlay">
                    <button className="see-btn">
                      <Link href={`/products/${item._id}`}>
                        <FaEye /> See
                      </Link>
                    </button>
                  </div>
                </div>

                <h4>{item.name}</h4>
                <p>{item.description ? `${item.description.slice(0, 100)}...` : ""}</p>

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

                <button className="seemore">
                  <Link href={`/products/${item._id}`}>
                    see details
                  </Link>
                </button>

                <button
                  type="button"
                  className="check-dates-btn"
                  onClick={() => setCalendarModalProduct(item)}
                  title="Check Booked Dates"
                >
                  <FaCalendarAlt /> Booked Dates
                </button>
              </div>
            );
          })}
        </div>

        {/* See More Button + Auto Trigger */}
        {hasMore && (
          <div className="see-more-wrapper" ref={seeMoreRef}>
            <button className="see-more-btn" onClick={handleSeeMore}>
              See More
            </button>
          </div>
        )}
      </div>

      {/* Calendar Modal */}
      {calendarModalProduct && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2222229999,
            padding: "16px"
          }}
          onClick={() => setCalendarModalProduct(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
              color: "#111827"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#111827" }}>{calendarModalProduct.name}</h3>
                <span style={{ fontSize: "0.82rem", color: "#6b7280" }}>Availability Calendar / المواعيد المحجوزة</span>
              </div>
              <button
                onClick={() => setCalendarModalProduct(null)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#6b7280" }}
              >
                <FaTimes />
              </button>
            </div>

            <AvailabilityCalendar
              productId={calendarModalProduct._id}
              bookedDates={calendarModalProduct.bookedDates}
            />

            <button
              onClick={() => setCalendarModalProduct(null)}
              style={{
                width: "100%",
                marginTop: "16px",
                padding: "10px",
                background: "#111827",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}