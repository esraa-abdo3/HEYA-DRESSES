import Link from "next/link";
import "./success.css";
import { FaCheckCircle } from "react-icons/fa";

export default async function SuccessPage() {

 

  return (
    <div className="success-container">
      <div className="card success">
        <div className="icons">
          <FaCheckCircle />
        </div>
        
        <h1> Payment Successful</h1>

        <p>Your order has been placed successfully.</p>

     
  
     
        {/* <Link href="/orders">
          <button className="btn">View My Orders</button>
        </Link> */}

        <Link href="/">
          <button className="btn secondary">Continue Shopping</button>
        </Link>
      </div>
    </div>
  );
}