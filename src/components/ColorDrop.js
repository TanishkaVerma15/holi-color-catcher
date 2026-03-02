import React from "react";

export default function ColorDrop({ color, xPos, yPos }) {
  return (
    <div
      style={{
        position: "absolute",
        top: `${yPos}px`,
        left: `${xPos}px`,
        width: "30px",
        height: "30px",
        borderRadius: "50%",
        background: color,
        border: "2px solid #fff",
        boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
        animation: "pulseDrop 1.2s infinite",
        transition: "transform 0.2s",
      }}
    ></div>
  );
}