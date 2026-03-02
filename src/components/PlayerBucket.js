import React from "react";

export default function PlayerBucket({ xPos, catching }) {
  return (
    <div style={{ position: "absolute", bottom: "10px", left: xPos, width: "80px", height: "80px", transition: "left 0.05s" }}>
      <img
        src="/images/holi-bucket.png"
        alt="Holi Bucket"
        style={{
          width: "100%",
          height: "100%",
          transform: catching ? "scale(1.1) rotate(-5deg)" : "scale(1)",
          transition: "transform 0.1s",
        }}
      />
      {catching && (
        <div
          style={{
            position: "absolute",
            top: "-20px",
            left: "50%",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #fff700, #ff4d6d)",
            transform: "translateX(-50%)",
            animation: "splash 0.4s ease-out",
          }}
        ></div>
      )}
    </div>
  );
}