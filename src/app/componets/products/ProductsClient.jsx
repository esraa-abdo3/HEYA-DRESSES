"use client";

import { useState } from "react";
import "./products.css"
import { useCart } from "@/app/Context/cartcontext";
import { FaHeart } from "react-icons/fa";
import { useWishlist, usewishlist } from "@/app/Context/WishlistContext";

export default function Getproducts({ products }) {
  const [category, setCategory] = useState("all");
  const { addToCart } = useCart();
  const { toggleWishlist, wishlist } = useWishlist();
  
 
  


  const filteredProducts =  category === "all" ? products : products.filter((p) => p.category.name === category);
  return (
    <div className="products">
      <div className="container">
        <div className="filters">
          <p
             className={category === "all" ? "active" : ""}
            onClick={() => setCategory("all")}>all</p>
          <p
             className={category === "dresses" ? "active" : ""}
            onClick={() => setCategory("dresses")}>dresses</p>
          <p
            className={category === "heels" ? "active" : ""}
            onClick={() => setCategory("heels")}>heels</p>
          <p
            className={category === "bags" ? "active" : ""}
            onClick={() => setCategory("bags")}>bags</p>
        </div>

        <div className="cards">
          {filteredProducts.length === 0 && (
            <p style={{textTransform:"uppercase" , margin:"30px 0"}}>no products found for this catagory</p>
          )}
          {filteredProducts.map((item) => (   
       <div key={item._id }  className="item">  
             <div
        style={{
        backgroundImage: `url(${item.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
                   }}
                   className="image"
              >
                <div
                  style={{color:wishlist.some(e => e._id === item._id)? "red":"white"}}

                  className="icon-wishlist" onClick={() => {
                    toggleWishlist(item)
                
                    
                }}>
                        <FaHeart />

                  </div>
            </div>
               <h3>{item.name}</h3>
               <p>{item.description}</p>
               <div className="action">
                <span>{item.price}$</span>
                     {item.stock === 0 ? 
                  <span className="outofstock">
                    out of stock
                  </span>
                  :
                  <p className="Add-to-card" onClick={() => addToCart(item)}>+</p>
                  
               }
                  
                   
              </div>
         
   

  </div>
))}
        </div>

      </div>
    </div>
  );
}