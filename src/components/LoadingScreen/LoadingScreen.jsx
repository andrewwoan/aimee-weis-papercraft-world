import React, { useRef, useState, useEffect } from "react";
import { useProgress } from "@react-three/drei";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import "./LoadingScreen.css";

const LoadingScreen = () => {
  const { progress, active } = useProgress();
  const [maxProgress, setMaxProgress] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [gone, setGone] = useState(false);

  const tlRef = useRef(null);
  const trRef = useRef(null);
  const blRef = useRef(null);
  const brRef = useRef(null);
  const loadingRef = useRef(null);

  useEffect(() => {
    if (active && progress === 100) return;
    if (progress > maxProgress) setMaxProgress(progress);
  }, [progress, active]);

  useGSAP(() => {
    if (!revealed) return;

    gsap.to(tlRef.current, {
      top: "-100%",
      left: "-100%",
      duration: 1,
      ease: "power2.inOut",
    });
    gsap.to(trRef.current, {
      top: "-100%",
      right: "-100%",
      duration: 1,
      ease: "power2.inOut",
    });
    gsap.to(blRef.current, {
      bottom: "-100%",
      left: "-100%",
      duration: 1,
      ease: "power2.inOut",
    });
    gsap.to(brRef.current, {
      bottom: "-100%",
      right: "-100%",
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => setGone(true),
    });
  }, [revealed]);

  const isLoaded = !active && maxProgress === 100;

  if (gone) return null;

  return (
    <>
      <div className="loading-screen">
        <div ref={tlRef} className="quadrant quadrant--tl" />
        <div ref={trRef} className="quadrant quadrant--tr" />
        <div ref={blRef} className="quadrant quadrant--bl" />
        <div ref={brRef} className="quadrant quadrant--br" />

        <div ref={loadingRef} className="loading-bar-container">
          <div
            className="loading-bar-fill"
            style={{ width: `${maxProgress}%` }}
          />
          <div
            className="loading-bar-indicator"
            style={{ left: `${maxProgress}%` }}
          />
        </div>

        {isLoaded && !revealed && (
          <button className="enter-button" onClick={() => setRevealed(true)}>
            Enter
          </button>
        )}
      </div>

      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="torn" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.065"
              numOctaves="4"
              seed="2"
            />
            <feDisplacementMap
              in="SourceGraphic"
              scale="12"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
    </>
  );
};

export default LoadingScreen;
