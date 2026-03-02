import React, { useEffect, useRef } from "react";

export default function ParticleBackground({ active, level = 1 }) {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const colors = ["#ff4d6d", "#ffbe0b", "#8338ec", "#3a86ff", "#06d6a0", "#ff6f61", "#ffd700"];
    const particles = [];
    const count = 150 + level * 10;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 2 + 0.5,
        angle: Math.random() * Math.PI * 2,
      });
    }

    const render = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
      gradient.addColorStop(0, "#fff1e6");
      gradient.addColorStop(1, "#a0e7e5");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        p.x += Math.sin(p.angle) * 0.5;
        p.y += p.speed;
        p.angle += 0.01;
        if (p.y > window.innerHeight) {
          p.y = -10;
          p.x = Math.random() * window.innerWidth;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    if (active) render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [active, level]);

  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }} />;
}