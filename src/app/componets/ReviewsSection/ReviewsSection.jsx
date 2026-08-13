"use client";
import React from "react";
import "./ReviewsSection.css";
import Link from "next/link";

export default function ReviewsSection() {
  const reviews = [
    {
      id: 1,
      img: "/reviews/1612308b-09c5-45f7-83b2-2a9f114aa626.jpg",
      alt: "Review by Amy Thomson",
      className: "review-card-1",
    },
    {
      id: 2,
      img: "/reviews/3720aadf-b448-4e66-857b-74a98be2b1e6.jpg",
      alt: "Review by Darcy Tyler",
      className: "review-card-2",
    },
    {
      id: 3,
      img: "/reviews/9c10a2d3-88a9-41f3-a5dc-afab9ad58684.jpg",
      alt: "Review by Mark Kong",
      className: "review-card-3",
    },
    {
      id: 4,
      img: "/reviews/ecd0bf0e-a8e7-4bb8-8cf2-493d49d9b374.jpg",
      alt: "Review by Mari Eikeland",
      className: "review-card-4",
    },
  ];

  // Optional extra screenshot badges to display as authentic proofs
  const badges = [
    { id: 5, img: "/reviews/Screenshot 2026-08-12 144009.png", alt: "Rating Badge 1" },
    { id: 6, img: "/reviews/Screenshot 2026-08-12 144057.png", alt: "Rating Badge 2" },
  ];

  return (
    <section className="reviews-section">
      {/* Blurred background image layer */}
      <div className="reviews-bg-overlay" />

      <div className="reviews-container">
        {/* Top Header - Logo and Title */}
        <div className="reviews-header">
          <div className="reviews-logo-wrap">
            <div className="reviews-logo-oval">
              <span className="reviews-logo-text">HD</span>
            </div>
          </div>
     <h2 className="reviews-title">
  WHAT OUR GIRLS
  <br />
  HAD TO SAY 💗
</h2>
        </div>

   
        <div className="reviews-layout">
          {/* SVG arrows connecting cards for desktop */}
          <div className="svg-connectors">
            {/* Arrow 1: Card 1 to Card 2 */}
            <svg className="connector-arrow arrow-1" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d="M 20,10 Q 60,10 70,85"
                fill="none"
                stroke="rgba(255, 255, 255, 0.75)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <path
                d="M 66,75 L 70,85 L 76,77"
                fill="none"
                stroke="rgba(255, 255, 255, 0.75)"
                strokeWidth="2"
              />
            </svg>

            {/* Arrow 2: Card 2 to Card 3 */}
            <svg className="connector-arrow arrow-2" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d="M 80,10 Q 30,15 25,85"
                fill="none"
                stroke="rgba(255, 255, 255, 0.75)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <path
                d="M 20,77 L 25,85 L 31,75"
                fill="none"
                stroke="rgba(255, 255, 255, 0.75)"
                strokeWidth="2"
              />
            </svg>

            {/* Arrow 3: Card 3 to Card 4 */}
            <svg className="connector-arrow arrow-3" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d="M 30,10 Q 75,10 75,85"
                fill="none"
                stroke="rgba(255, 255, 255, 0.75)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <path
                d="M 70,76 L 75,85 L 81,77"
                fill="none"
                stroke="rgba(255, 255, 255, 0.75)"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* Staggered cards */}
          {reviews.map((rev) => (
            <div key={rev.id} className={`review-card-wrapper ${rev.className}`}>
              <div className="review-card">
                <img src={rev.img} alt={rev.alt} className="review-image" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer Area - Model handle / next indicator and badges */}
        <div className="reviews-footer">
          <div className="badges-container">
            {badges.map((badge) => (
              <div key={badge.id} className="badge-card">
                <img src={badge.img} alt={badge.alt} className="badge-image" />
              </div>
            ))}
          </div>
          
          <div className="reviews-footer-right">
    
            <Link href={"/"}>
                 <span className="instagram-handle">@heya.dresses</span>
            </Link>
         
          </div>
        </div>
      </div>
    </section>
  );
}
