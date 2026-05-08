"use client";

import { useCart } from "../Context/cartcontext";
import Link from "next/link";
import "./page.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { RiChatDeleteFill } from "react-icons/ri";

import { useWishlist } from "../Context/WishlistContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, setCart, allpromocodes } = useCart();

  const { setWishlist } = useWishlist();
  const router = useRouter();
  const [form, setForm] = useState({
  name: "",
  street: "",
  building: "",
  phone: "",
  paymentMethod: "cash",
   });
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState("");
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
const total = cart.reduce((acc, item) => {
  const price = item.productId.price || 0;
  return acc + price * item.quantity;
}, 0);
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const finalTotal = isPromoApplied
  ? total - (total * discount / 100)
  : total;
  const [outofstock, setoutofstock] = useState(0);
  const guestId = localStorage.getItem("guestId");
function detectStock() {
  const count = cart.filter(
    (e) => e.productId.stock === 0
  ).length;

  setoutofstock(count);
  }
 
  useEffect(() => {
  detectStock()   
  },[])
const fetchWishlist = async () => {
  try {
    const res = await axios.get("/api/Wishlist");
    console.log("res from client", res.data)
    setWishlist(res.data.items);
  } catch (err) {
    console.log(err);
  }
};
const handleCheckout = async (e) => {
  e.preventDefault();

  // 🧠 validation
  if (!form.name.trim()) {
    seterror("Please enter All fields");
    return;
  }

  if (!form.street.trim()) {
     seterror("Please enter All fields");
    return;
  }

  if (!form.building.trim()) {
     seterror("Please enter All fields");
    return;
  }

  if (!form.phone.trim()) {
    seterror("Please enter All fields");
    return;
  }

  if (cart.length === 0) {
   seterror("Please enter All fields");
    return;
  }
  if (outofstock > 0) {
    seterror("please remove outstocked items before checkout");
    return
 }
  seterror("");
     setloading(true);
const payload = {
  items: cart.map((item) => ({
    productId: item.productId._id,
    quantity: item.quantity,
  })),
  address: {
    name: form.name,
    street: form.street,
    building: form.building,
    phone: form.phone,
  },
  paymentMethod: form.paymentMethod,
  guestId: guestId || null,
};

if (isPromoApplied && promo) {
  payload.promoCode = promo;
  }




  try {
    const res = await axios.post("/api/Order", payload);
    

    // 💳 Stripe
    if (form.paymentMethod === "credit_card") {
      window.location.href = res.data.url;
      return;
    }
     
if (!guestId) {
  await fetchWishlist();
}
  
    router.push("success")
       setCart([]);

  


     
   

  } catch (error) {
    console.log(error.message);
    seterror("Something went wrong, please try again");
   
  } finally {
    setloading(false);
  }
   };


const applyPromo = () => {
  if (isPromoApplied) {
    setPromoMessage("Promo already applied");
    setTimeout(() => setPromoMessage(""), 2000);
    return;
  }

  const foundPromo = allpromocodes.find(
    (p) => p.name.toLowerCase() === promo.toLowerCase()
  );

  if (!foundPromo) {
    setPromoMessage("Invalid promo code");
    setTimeout(() => setPromoMessage(""), 2000);
    return;
  }

  setDiscount(foundPromo.discount);
  setIsPromoApplied(true);

  setPromoMessage("Promo applied successfully");
  setTimeout(() => setPromoMessage(""), 2000);
};

const removePromo = () => {
  setDiscount(0);
  setIsPromoApplied(false);
  setPromo("");

  setPromoMessage("Promo removed");
  setTimeout(() => setPromoMessage(""), 2000);
};
  return (
    <div className="cart-page">
      <h1 className="title">Your Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="empty">
          <h2>Your cart is empty</h2>
          <p>Start shopping now 🚀</p>
          <Link href="/products">
            <button className="btn-shop">Go to Products</button>
          </Link>
        </div>
      ) : (
          <>
            <div className="flex"> 

          <div className="cart-grid">
            {cart.map((item) => (
              <div className="cart-item" key={item._id}>
                
                {/* IMAGE */}
                <img
                  src={item.productId.image}
                  alt={item.productId.name}
                  className="product-img"
                />

                {/* INFO */}
                <div className="info">
                  <h3>{item.productId.name}</h3>
                  <p className="desc">
                    {item.productId.description?.slice(0, 60)}...
                  </p>

                  <p className="price">
                    ${item.productId.price}
                  </p>

                  {/* QUANTITY CONTROL */}
                  {item.productId.stock === 0 ? 
       <div style={{ color: "red", fontWeight: "bold" }}>
    Out of Stock
  </div>
                   :     <div className="qty">
                    <button onClick={() => {
                   updateQuantity(item.productId._id, "dec");
                    }}
                    >
                      -
                    </button>

                    <span>{item.quantity  > item.productId.stock ?  item.productId.stock:item.quantity}</span>

                    <button
                      onClick={() => {
                         if (item.quantity === item.productId.stock) {
                   alert("⚠️ You reached the stock limit");
                  return;
                      }
                        updateQuantity(item.productId._id, "inc");
                      
                    }}
               
                    >
                      +
                    </button>
                  </div>}
              
                </div>

                {/* REMOVE */}
                <button
                  className="remove"
                  onClick={() => {
                    console.log("removed")
                    removeFromCart(item.productId._id)
                  }}
                >
                  🗑
                </button>
              </div>
            ))}

              </div>
        
          

       
          <div className="summary">
                <h2>Order Summary</h2>
                
        
                <div className="line">
                  <span> Discount</span>
                  <span>{ discount}$</span>
                </div>
                       <div className="line">
              <span>Subtotal</span>
              <span>${finalTotal.toFixed(2)}</span>
                </div>

                <div className="line">
                  <span>shipping</span>
              <span>free</span>
             
                </div>
                <div className="promo-box">
                <h3>Have a promo code?</h3>

                   <div className="promo-input">
    <input
      type="text"
      placeholder="Enter promo code"
      value={promo}
      onChange={(e) => setPromo(e.target.value)}
    />

    <button onClick={applyPromo}>
      Apply
    </button>
                  </div>
                  {isPromoApplied &&
                    <div className="addedpromo">
                                        <p >
                    {promo} is added successfully
                  
                      </p>
                      <RiChatDeleteFill onClick={removePromo}
                        style={{ cursor: "pointer" }}
                        
                      />
                      </div>
                  }

                 {promoMessage && (
    <p className={`promo-msg ${discount ? "success" : "error"}`}>
      {promoMessage}
    </p>
                 )}
               </div>
          
             
          
  <div className="address-form">
    <input
      placeholder="Full Name"
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
    />

    <input
      placeholder="Street"
      value={form.street}
      onChange={(e) => setForm({ ...form, street: e.target.value })}
    />

    <input
      placeholder="Building"
      value={form.building}
      onChange={(e) => setForm({ ...form, building: e.target.value })}
    />

    <input
      placeholder="Phone"
      value={form.phone}
      onChange={(e) => setForm({ ...form, phone: e.target.value })}
    />
                </div>
                     {error &&
                  <span style={{color:"red", font:"14px"}}>{ error}</span>
                }

  <div className="payment-method">
    <h4>Payment Method</h4>

    <label>
      <input
        type="radio"
        checked={form.paymentMethod === "cash"}
        onChange={() =>
          setForm({ ...form, paymentMethod: "cash" })
        }
      />
      Cash on Delivery
    </label>

    <label>
      <input
        type="radio"
        checked={form.paymentMethod === "credit_card"}
        onChange={() =>
          setForm({ ...form, paymentMethod: "credit_card" })
        }
      />
      Credit Card 
    </label>
  </div>
               

                <button className="checkout" onClick={ handleCheckout}>{loading ? <span className="loader"></span> : "checkout"}</button>
              </div>
              </div>
        </>
      )}
    </div>
  );
}