import ScrollToProducts from "../componets/ScrollToProducts/ScrollToProducts";
import ReviewsSection from "../componets/ReviewsSection/ReviewsSection";
import InstructionsModal from "../componets/InstructionsModal/InstructionsModal";
import Products from "./products/productclient";
import VideoBanner from "../componets/VideoBanner/VideoBanner";

export default function Home() {
  return (
    <>
      <InstructionsModal />

 


      <div className="main-content-layer">
        <section className="hero-section">
          <div className="hero-image-wrap">
            <img
              src="hero.png"
              alt="Elegant evening dress"
              className="hero-image"
            />
            <div className="hero-scrim" />
          </div>

          <div className="hero-content">
            <span className="hero-label">NEW COLLECTION JUST FOR YOU</span>
            <h1 className="hero-title">
              Glow with
              <br />
              <em>Elegance</em>
            </h1>
            <span className="hero-divider" />
            <p className="hero-subtitle">
              Refined pieces designed with fluid silhouettes and considered
              detail. From evening events to everyday moments, each design is
              made to move with you and last well beyond the season.
            </p>
            <div className="hero-buttons">
              <ScrollToProducts />
            </div>
          </div>
        </section>

        <div id="products-section">
          <Products />
        </div>

        {/* <VideoBanner /> */}
             
      </div>
       <ReviewsSection />
    </>
  );
}