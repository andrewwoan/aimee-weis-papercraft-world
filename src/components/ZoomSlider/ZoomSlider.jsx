import React, { useRef } from "react";
import "./ZoomSlider.css";
import { useCameraStore } from "../../store/useCameraStore";

const ZoomSlider = () => {
  const setZoom = useCameraStore((state) => state.setZoom);

  const handleChange = useRef((e) => {
    setZoom(parseFloat(e.target.value));
  });

  return (
    <div className="zoom-slider-wrapper">
      {/* Left SVG — zoom out */}
      <div className="zoom-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
        </svg>
      </div>

      <input
        type="range"
        className="zoom-slider"
        min={1}
        max={3}
        step={0.01}
        defaultValue={1}
        onChange={handleChange.current}
      />

      <div className="zoom-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      </div>
    </div>
  );
};

export default ZoomSlider;
