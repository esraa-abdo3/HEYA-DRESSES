"use client";
import React, { useState, useEffect } from "react";
import { IoCloseOutline } from "react-icons/io5";
import "./InstructionsModal.css";

export default function InstructionsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
   
    const hasSeen = sessionStorage.getItem("heya_instructions_seen");
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      sessionStorage.setItem("heya_instructions_seen", "true");
    }, 450);
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isClosing ? "fade-out" : "fade-in"}`}>
      <div className={`modal-content ${isClosing ? "scale-down" : "scale-up"}`}>
      
        <button className="modal-close-btn" onClick={handleClose} aria-label="Close modal">
          <IoCloseOutline size={24} />
        </button>

      
        <div className="modal-header">
          <h2 className="modal-title">Rental Policy & Care Guidelines</h2>
          <p className="modal-subtitle">Please read carefully before proceeding to store</p>
          <div className="modal-header-line" />
        </div>

        {/* List of policies with numbered circles */}
        <div className="modal-body">
          <div className="policy-row">
            <div className="policy-number-circle">
              <span>01</span>
            </div>
            <div className="policy-description">
              <h4>Delivery Timeline</h4>
              <p>The dress is delivered to you exactly <strong>24 hours</strong> before your scheduled event.</p>
            </div>
          </div>

          <div className="policy-row">
            <div className="policy-number-circle">
              <span>02</span>
            </div>
            <div className="policy-description">
              <h4>Deposit Refund</h4>
              <p>The security deposit is strictly refundable only within <strong>24 hours</strong> after the dress is returned.</p>
            </div>
          </div>

          <div className="policy-row">
            <div className="policy-number-circle">
              <span>03</span>
            </div>
            <div className="policy-description">
              <h4>Late Return Penalty</h4>
              <p>Delaying the return will result in a <strong>50% deduction</strong> from your deposit per day of delay.</p>
            </div>
          </div>

          <div className="policy-row">
            <div className="policy-number-circle">
              <span>04</span>
            </div>
            <div className="policy-description">
              <h4>Garment Care</h4>
              <p>Please handle the dress with utmost care and keep it safe from any damages until returned.</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="modal-footer">
          <button className="modal-accept-btn" onClick={handleClose}>
            I AGREE & ACCEPT
          </button>
        </div>
      </div>
    </div>
  );
}
