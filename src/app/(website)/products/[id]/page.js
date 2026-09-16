"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSelectedProduct } from "../../../Context/SelectedProductContext";
import { useWishlist } from "@/app/Context/WishlistContext";
import { FaHeart, FaCalendarAlt, FaTimes } from "react-icons/fa";
import AvailabilityCalendar from "../../../componets/AvailabilityCalendar/AvailabilityCalendar";
import "./page.css";

export default function ProductDetails() {
  const { id } = useParams();
  const { selectedProduct, setSelectedProduct } = useSelectedProduct();
  const { toggleWishlist, wishlist } = useWishlist();
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/Products/${id}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();

        console.log("API response:", data);
        const product = data?.product || data?.data || data;

        setSelectedProduct(product);
        setMainImage(product?.images?.[0] || "");
      } catch (err) {
        setError(err.message || "حصل خطأ أثناء تحميل المنتج");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="product-details">
        <div className="container">
          <div className="details-left">
            <div className="main-image-wrapper">
              <div className="skeleton-pulse main-image-skeleton" />
            </div>

            <div className="thumbnails">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="thumb">
                  <div className="skeleton-pulse thumb-skeleton" />
                </div>
              ))}
            </div>
          </div>

          <div className="details-right">
            <div className="skeleton-pulse sk-title" />
            <div className="skeleton-pulse sk-badge" />
            <div className="skeleton-pulse sk-stock" />

            <div className="description">
              <div className="skeleton-pulse sk-heading" />
              <div className="skeleton-pulse sk-line" />
              <div className="skeleton-pulse sk-line" style={{ width: "90%" }} />
              <div className="skeleton-pulse sk-line" style={{ width: "70%" }} />
            </div>

            <div className="skeleton-pulse sk-price" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="details-empty">
        <p>{error}</p>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="details-empty">
        <p>No specific product selected. Please go back and select a product.</p>
      </div>
    );
  }

  const {
    name,
    description,
    price,
    priceAfterDiscount,
    images = [],
    stock,
    isNew,
    isBestSeller,
    bookedDates = [],
    _id,
  } = selectedProduct;

  const discountPercent = priceAfterDiscount
    ? Math.round(100 - (priceAfterDiscount / price) * 100)
    : null;

  const isInWishlist = wishlist.some((e) => e._id === _id);

  return (
    <div className="product-details">
      <div className="container">
        <div className="details-left">
          <div className="main-image-wrapper">
            {isNew && <span className="badge badge-new">New</span>}

            <div
              className="icon-wishlist"
              style={{ color: isInWishlist ? "red" : "white" }}
              onClick={() => toggleWishlist(selectedProduct)}
            >
              <FaHeart />
            </div>

            {mainImage && (
              <img src={mainImage} alt={name} className="main-image" />
            )}
          </div>

          {images.length > 1 && (
            <div className="thumbnails">
              {images.map((img, index) => (
                <div
                  key={index}
                  className={`thumb ${mainImage === img ? "active" : ""}`}
                  onClick={() => setMainImage(img)}
                >
                  <img src={img} alt={`${name}-${index}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="details-right">
          <h1 className="product-name">{name}</h1>
          {isBestSeller && <span className="badge-best">Best Seller</span>}

          <div className="stock-row">
            {stock > 0 ? (
              <span className="in-stock">in stock</span>
            ) : (
              <span className="out-stock">out of stock</span>
            )}
          </div>

          <div className="description">
            <h3>description:</h3>
            <p>{description || "no description to this product"}</p>
          </div>

          <div className="price-row">
            <span className="price-current">
              <span style={{ fontSize: "19px" }}>price:</span>
              {priceAfterDiscount ?? price} LE
            </span>
            {priceAfterDiscount && (
              <>
                <span className="price-original">{price} LE</span>
                <span className="price-discount-badge">-{discountPercent}%</span>
              </>
            )}
          </div>

          {/* Availability Calendar Section Button */}
          {/* <div className="availability-section">
            <button
              type="button"
              className="view-booked-days-btn"
              onClick={() => setShowCalendarModal(true)}
            >
              <FaCalendarAlt className="btn-calendar-icon" />
              <span>شوف الأيام المحجوزة</span>
            </button>
          </div> */}
        </div>
      </div>

      {/* Availability Calendar Modal
      {showCalendarModal && (
        <div
          className="calendar-modal-backdrop"
          onClick={() => setShowCalendarModal(false)}
        >
          <div
            className="calendar-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="calendar-modal-header">
              <div>
                <h3 className="calendar-modal-title">{name}</h3>
                <p className="calendar-modal-subtitle">جدول الأيام المحجوزة • Live Availability</p>
              </div>
              <button
                type="button"
                className="calendar-modal-close-icon"
                onClick={() => setShowCalendarModal(false)}
                aria-label="إغلاق"
              >
                <FaTimes />
              </button>
            </div>

            <div className="calendar-modal-body">
              <AvailabilityCalendar productId={_id} bookedDates={bookedDates} />
            </div>

            <button
              type="button"
              className="calendar-modal-close-btn"
              onClick={() => setShowCalendarModal(false)}
            >
              إغلاق
            </button>
          </div>
        </div>
      )} */}
    </div>
  );
}