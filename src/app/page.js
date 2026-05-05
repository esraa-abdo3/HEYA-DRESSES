
import ScrollToProducts from "./componets/ScrollToProducts/ScrollToProducts";
import Products from "./products/productclient"
export default function Home() {
  return (
    <>
  

       <div className="hero-section">
      <div className="hero-overlay" />

      <div className="hero-content">
        <span className="hero-label">NEW COLLECTION</span>
        <h1 className="hero-title">
          Glow with<br />Elegance
        </h1>
        <div className="hero-divider" />
        <p className="hero-subtitle">
          Timeless designs for every special moment.<br />
          Because you deserve to shine.
        </p>
        <div className="hero-buttons">
          <button className="btn-primary">Sign up</button>
         <ScrollToProducts/>
        </div>
        </div>
        </div>
      
        <div id="products-section">
                <Products />
            </div>
        
      </>
 
  );
}
