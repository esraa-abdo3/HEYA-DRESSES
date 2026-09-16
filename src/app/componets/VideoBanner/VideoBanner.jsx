"use client";

import React, { useEffect, useRef, useState } from "react";
import "./VideoBanner.css";
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp } from "react-icons/fa";

export default function VideoBanner() {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`video-banner-section ${isVisible ? "animate-in" : ""}`}
    >
      {/* Background Video Layer */}
      <div className="video-wrap">
        <video
          ref={videoRef}
          src="/summer-dress.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="banner-video"
        />
        <div className="video-overlay" />
      </div>

      {/* Luxury Content Overlay */}
      <div className="video-content">
        <span className="video-badge">SUMMER COLLECTION 2026 • HEYA DRESSES</span>
        <h2 className="video-title">
          Flow in Grace, <br />
          <em>Shine in Motion</em>
        </h2>
        <p className="video-subtitle">
          تألقي بأرقى الفساتين الصيفية المصممة بعناية لتبرز جمالكِ في كل مناسبة.
          احجزي فستانكِ المميز الآن واستمتعي بإطلالة ساحرة لا تُنسى.
        </p>

        <div className="video-actions">
          <a href="#products-section" className="video-btn-primary">
            Explore Summer Dresses ✦
          </a>
          <div className="video-controls">
            <button
              type="button"
              className="ctrl-btn"
              onClick={togglePlay}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button
              type="button"
              className="ctrl-btn"
              onClick={toggleMute}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
