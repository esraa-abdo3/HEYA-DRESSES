 "use client"
import { useEffect, useState } from "react";
import "./Myorders.css"
import { FaSortAmountDown, FaSortAmountUp, FaMoneyBillWave, FaCoins } from "react-icons/fa";
import { FaArrowTrendDown } from "react-icons/fa6";
import { FaArrowTrendUp } from "react-icons/fa6";
import { useCart } from "@/app/Context/cartcontext";
import Link from "next/link";
import axios from "axios";
export default function HistoryOrder({ orders }) {
  const [sortType, setSortType] = useState("newest"); 
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 3;
  const { addToCart} = useCart();
  const [guestId, setGuestId] = useState(null);


useEffect(() => {
  const id = localStorage.getItem("guestId");
  setGuestId(id);
}, []);
  const [gestorder, setgestorder] = useState([]);
   useEffect(() => {
  const fetchOrders = async () => {
    try {
      const guestId = localStorage.getItem("guestId");

      // لو مفيش guestId خلاص متعملش request
      if (!guestId) return;

      const res = await axios.get(`/api/Order?guestId=${guestId}`);
console.log(res)
      setgestorder(res.data.orders);
    } catch (err) {
      console.log(err);
    }
  };

  fetchOrders();
}, []);
  console.log(gestorder)
const data = guestId ? gestorder : orders;
  console.log("data is",data)
  const sortedOrders = [...data].sort((a, b) => {
  if (sortType === "newest") {
    return new Date(b.createdAt) - new Date(a.createdAt);
  }
  if (sortType === "oldest") {
    return new Date(a.createdAt) - new Date(b.createdAt);
  }
  if (sortType === "price-high") {
    return b.totalPrice - a.totalPrice;
  }
  if (sortType === "price-low") {
    return a.totalPrice - b.totalPrice;
  }
  });
const indexOfLast = currentPage * ordersPerPage;
const indexOfFirst = indexOfLast - ordersPerPage;
const currentOrders = sortedOrders.slice(indexOfFirst, indexOfLast);

const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });

  const getStatusStyle = (status) =>
    status === "paid"
      ? { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" }
      : { bg: "#fffbeb", color: "#92400e", border: "#fde68a" };

  return (
    <div className="history-order" style={{ padding: "3rem 0", fontFamily: "inherit" }}>
          <div className="Container">
      <h2 style={{ fontSize: 22, fontWeight: 700 , textTransform:"uppercase"}}>Your Orders</h2>
  

        {currentOrders.length == 0 ? (
          <div style={{textAlign:"center", fontWeight:"bold"}}> No Orders For You yet ! </div>
        ) :
          (
            <>
                   <div style={{ display: "flex", justifyContent: "end", alignItems: "center", margin: "1.25rem 0", flexWrap: "wrap", gap: 8 }}>
    
    <button onClick={() => setSortType("newest")}   style={{
          backgroundColor: "#80808030",
            padding: "7px 10px",
    borderRadius:"4px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 14,
            color: sortType === "newest" ? "rgb(2, 92, 84)" : "#777",
    fontWeight:"700"
  }}>
    <FaSortAmountDown title="Newest" /> Newest
  </button>

  <button onClick={() => setSortType("oldest")}   style={{
           backgroundColor: "#80808030",
            padding: "7px 10px",
    borderRadius:"4px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 14,
            color: sortType === "oldest" ? "rgb(2, 92, 84)" : "#777",
    fontWeight:"700"
  }}>
    <FaSortAmountUp title="Oldest" /> Oldest
  </button>

  <button onClick={() => setSortType("price-high")}   style={{
            backgroundColor: "#80808030",
            padding: "7px 10px",
    borderRadius:"4px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 14,
            color: sortType === "price-high" ? "rgb(2, 92, 84)" : "#777",
    fontWeight:"700"
  }}>
    <FaArrowTrendUp title="High Price" /> Highest Price
  </button>

  <button onClick={() => setSortType("price-low")}   style={{
            backgroundColor: "#80808030",
            padding: "7px 10px",
    borderRadius:"4px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 14,
            color: sortType === "price-low" ? "rgb(2, 92, 84)" : "#777",
    fontWeight:"700"
  }}>
    <FaArrowTrendDown title="Low Price" />Lowest Price
  </button>


              </div>
                  {currentOrders.map((order) => {
        const status = getStatusStyle(order.paymentStatus);
        return (
          <div key={order._id} style={{ background: "white", borderRadius: 8, border: "1px solid #eee", marginBottom: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            
            {/* Header */}
            <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, borderBottom: "1px solid #f0f0f0" }}>
              <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>Order Date</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{formatDate(order.createdAt)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>Total Price</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>${order.totalPrice}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>Payment</div>
                  <div style={{ fontSize: 13, fontWeight: 500, textTransform: "capitalize" }}>{order.paymentMethod}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                <div style={{ fontSize: 12, color: "#888" }}>Order: #{order._id}</div>
           
              </div>
            </div>

            {/* Payment Status */}
            <div style={{ padding: "8px 18px", fontSize: 12, background: status.bg, color: status.color, borderBottom: `1px solid ${status.border}` }}>
              Payment: {order.paymentStatus} · {order.paymentProvider}
            </div>

            {/* Items */}
            <div style={{ padding: "8px 18px 4px", fontSize: 13, fontWeight: 500 }}>Processing</div>

            {order.items.map((item) => (
              <div key={item._id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderTop: "1px solid #f5f5f5"  , flexWrap:"wrap"}}>
                <div style={{
                  width: 70, height: 70, borderRadius: 8, border: "1px solid #eee", background: "#f9f9f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#ccc", flexShrink: 0,
                  backgroundImage: `url(${item.productId.image})`,
                backgroundSize: "cover",
backgroundPosition: "center",
backgroundRepeat: "no-repeat"
                }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Product #{item.productId._id}</div>
                  <div style={{ fontSize: 12, color: "#777" }}>Qty: {item.quantity} · Unit price: ${item.price.toLocaleString()}</div>
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <button disabled={item.productId.stock === 0} style={{ fontSize: 12, color: item.productId.stock ===0? "red":"#3b4cca", background: "none", border: "none", cursor: item.productId.stock === 0 ? "not-allowed":"pointer", padding: 0 }} onClick={() => {
                      addToCart(item.productId)
                      console.log(item.productId)
                    }}> { item.productId.stock ===0? "out  of stock" :"↻ Buy it again"}</button>
                    <span style={{ color: "#ddd" }}>|</span>
                    <Link href={`/`}>
                      <button style={{ fontSize: 12, color: "#3b4cca", background: "none", border: "none", cursor: "pointer", padding: 0 }}>👁 View Product</button></Link>
                  
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>${(item.price * item.quantity).toLocaleString()}</div>
              </div>
            ))}
          </div>
        );
                  })}
              
                      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 20 }}>
          {totalPages > 1 &&
          
            Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
    
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid  rgb(2, 92, 84)",
                  background: currentPage === page ? "rgb(2, 92, 84)" : "white",
                  color: currentPage === page ? "white" : "#333",
                  cursor: "pointer"
                }}
              >
                {page}
              </button>
            ))
          }
          
          

       

</div>
            </>
          )
   }

 

  

      </div>
         </div>
    
  );
}