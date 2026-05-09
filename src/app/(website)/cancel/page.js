import Link from "next/link";
import "./cancel.css";
import { FaTimesCircle } from "react-icons/fa";

export default function CancelPage() {
  return (
    <div className="cancel-container">
          <div className="card cancel">
        <div className="icon">
          <FaTimesCircle />
        </div>
        <h1> Sorry! Payment Cancelled</h1>

              <p>Your payment was not completed.
                  <p style={{padding:"5px 0"}}>
                        You can try again or return to shopping.
                    </p>
           
        </p>
              <div style={{display:"flex", gap:"25px"  , justifyContent:"center"}}>
                          <Link href="/Cart">
          <button className="btn">Back to Cart</button>
        </Link>

        <Link href="/">
          <button className="btn secondary">Shop Again</button>
        </Link>
                  
</div>

      </div>
    </div>
  );
}