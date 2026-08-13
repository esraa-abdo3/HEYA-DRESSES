"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./products.css";
import { FaHeart, FaEye } from "react-icons/fa";
import { useWishlist } from "@/app/Context/WishlistContext";
import { useSelectedProduct } from "../../Context/SelectedProductContext";
import Link from "next/link";

export default function Getproducts({ products }) {
  const [category, setCategory] = useState("all");
  const { toggleWishlist, wishlist } = useWishlist();
  const { setSelectedProduct } = useSelectedProduct();
  const router = useRouter();

  const filteredProducts =
    category === "all" ? products : products.filter((p) => p.category.name === category);




  return (
    <div className="products">
      <div className="container">
        <div className="filters">
          <p className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>all</p>
          <p className={category === "dresses" ? "active" : ""} onClick={() => setCategory("dresses")}>dresses</p>

          <p className={category === "Bags" ? "active" : ""} onClick={() => setCategory("Bags")}>bags</p>
        </div>

        <div className="cards">
          {filteredProducts.length === 0 && (
            <p style={{ textTransform: "uppercase", margin: "30px 0" }}>no products found for this catagory</p>
          )}

          {filteredProducts.map((item) => (
            <div key={item._id} className="item">
              <div
                style={{
                  backgroundImage: `url(${item.images[0]})`,
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
                 
                  
                  <button className="see-btn" >
                     <Link href={`/products/${item._id}`}>
                      <FaEye /> See
                          </Link>
                    </button>
                
                </div>
              </div>

              <h4>{item.name}</h4>
              <p>{item.description.slice(0, 100)}...</p>

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

              <button className="seemore" >
                  <Link href={`/products/${item._id}`}>
                  see details
                  </Link>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}