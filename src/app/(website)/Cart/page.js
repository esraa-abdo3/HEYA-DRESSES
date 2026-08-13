"use client";

import { useCart } from "../../Context/cartcontext";
import Link from "next/link";
import "./page.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { RiChatDeleteFill } from "react-icons/ri";

import { useWishlist } from "../../Context/WishlistContext";

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

  // 📅 booking date (rental day) — defaults to today, must stay within current month
  const todayISO = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);
  const [bookingDate, setBookingDate] = useState(todayISO);
  const [note, setNote] = useState("");

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

  // upcoming booked days (this month, from today onward) for a single product,
  // read directly from the product document (product.bookedDates)
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
      .map((d) => d.toISOString().slice(0, 10));
  };

  // union of every date already booked for ANY product currently in the cart,
  // since one order books all cart items for the same day
  const blockedDatesForCart = new Set();
  cart.forEach((item) => {
    getUpcomingBookedDays(item.productId).forEach((d) => blockedDatesForCart.add(d));
  });
  const isBookingDateBlocked = blockedDatesForCart.has(bookingDate);

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
  if (!bookingDate) {
    seterror("Please choose a booking date");
    return;
  }
  if (bookingDate < todayISO || bookingDate > lastDayOfMonth) {
    seterror("Booking date must be within the current month, starting today");
    return;
  }
  if (blockedDatesForCart.has(bookingDate)) {
    seterror("One or more items in your cart are already booked on this date. Please choose another day.");
    return;
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
  paymentMethod: "cash",
  guestId: guestId || null,
  bookingDate,
  note,
};

if (isPromoApplied && promo) {
  payload.promoCode = promo;
  }




  try {
    const res = await axios.post("/api/Order", payload);

if (!guestId) {
  await fetchWishlist();
}
  
    router.push("success")
       setCart([]);

  


     
   

  } catch (error) {
    console.log(error.message);
    seterror(error.response?.data?.message || "Something went wrong, please try again");
   
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
          <Link href="/">
            <button className="btn-shop">Go to Products</button>
          </Link>
        </div>
      ) : (
          <>
            <div className="flex"> 

          <div className="cart-grid">
            {cart.map((item) => (
              <div className="cart-item" key={item.productId._id}>
                
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

                  {getUpcomingBookedDays(item.productId).length > 0 && (
                    <p className="booked-days-hint">
                      Already booked this month on:{" "}
                      {getUpcomingBookedDays(item.productId)
                        .map((d) =>
                          new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        )
                        .join(", ")}
                    </p>
                  )}

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

  <div className="booking-date">
    <h4>Booking Date</h4>
    <p className="hint">Choose the day you want to rent these items (this month only)</p>
    <input
      type="date"
      value={bookingDate}
      min={todayISO}
      max={lastDayOfMonth}
      onChange={(e) => setBookingDate(e.target.value)}
    />
    {isBookingDateBlocked && (
      <p className="date-blocked-warning">
        ⚠️ One of the items in your cart is already booked on this date. Please pick another day.
      </p>
    )}
  </div>

  <div className="booking-note">
    <h4>Note (optional)</h4>
    <textarea
      placeholder="Anything we should know? e.g. pickup time, special request..."
      value={note}
      onChange={(e) => setNote(e.target.value)}
      rows={3}
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
        checked={true}
        readOnly
      />
      Cash on Pickup / Delivery
    </label>
  </div>
               

                <button className="checkout" disabled={isBookingDateBlocked} onClick={ handleCheckout}>{loading ? <span className="loader"></span> : "checkout"}</button>
              </div>
              </div>
        </>
      )}
    </div>
  );
}