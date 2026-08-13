"use client";
import "./shop.css";

const lookItems = [
  {
    label: "Dress",
    name: "Flowy Yellow Soirée Dress",
  },
  {
    label: "Necklace",
    name: "Delicate Gold Necklace",
  },
  {
    label: "Hijab",
    name: "Soft White Hijab",
  },
  {
    label: "Heels",
    name: "Strappy Black Heels",
  },
];

export default function ShopTheLook() {
  const handleScroll = () => {
    document
      .getElementById("products-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="look-section">
      <div className="container look-container">
        <div className="look-image-wrap">
          <img
            src="/look-yellow-dress.png"
            alt="Yellow soirée dress styled with gold necklace, white hijab and black heels"
            className="look-image"
          />
        </div>

        <div className="look-content">
          <span className="look-label">SHOP THE LOOK</span>
          <h2 className="look-title">
            Yellow <em>Soirée</em>
          </h2>
          <p className="look-subtitle">
            Light, flowy and effortlessly elegant — a soft yellow gown with
            dramatic bell sleeves, paired with gold, white and black to
            keep the whole look balanced.
          </p>

          <ul className="look-list">
            {lookItems.map((item) => (
              <li className="look-item" key={item.label}>
                <span className="look-item-label">{item.label}</span>
                <span className="look-item-name">{item.name}</span>
              </li>
            ))}
          </ul>

          <button className="btn-outline look-btn" onClick={handleScroll}>
            SHOP THIS LOOK
          </button>
        </div>
      </div>
    </section>
  );
}