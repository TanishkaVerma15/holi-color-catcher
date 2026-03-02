import React, { useState, useEffect, useRef, useCallback } from "react";
import PlayerBucket from "./PlayerBucket";
import ColorDrop from "./ColorDrop";
import ParticleBackground from "./ParticleBackground";
import confetti from "canvas-confetti";
import { Container, Modal, Button } from "react-bootstrap";
import "../styles/Holi.css";

// Normal colors and tricky ones
const COLORS = [
  { color: "#ff4d6d", points: 10, type: "normal" },
  { color: "#ffbe0b", points: 15, type: "normal" },
  { color: "#8338ec", points: 20, type: "normal" },
  { color: "#3a86ff", points: -5, type: "tricky" },
];

// Power-ups
const POWERUPS = [
  { color: "gold", points: 50, type: "golden" },
  { color: "linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)", points: 0, type: "rainbow" },
];

// Holi Quotes Array
const HOLI_QUOTES = [
  "Let the colors of Holi spread the message of peace and happiness! 🕊️🌈"
];

export default function GameContainer() {
  const [playerPos, setPlayerPos] = useState(200);
  const [drops, setDrops] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [topScores, setTopScores] = useState(() => JSON.parse(localStorage.getItem("holiTopScores")) || []);
  const [gameOver, setGameOver] = useState(false);
  const [catching, setCatching] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const [velocity, setVelocity] = useState(0);
  const [quote, setQuote] = useState("");

  const containerRef = useRef();
  const containerWidth = 500;
  const bucketWidth = 80;
  const MAX_LEVEL = 5;

  // Keyboard control
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") setVelocity(-8);
      if (e.key === "ArrowRight") setVelocity(8);
    };
    const handleKeyUp = () => setVelocity(0);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const move = () => {
      setPlayerPos((pos) => {
        let newPos = pos + velocity;
        if (newPos < 0) newPos = 0;
        if (newPos > containerWidth - bucketWidth) newPos = containerWidth - bucketWidth;
        return newPos;
      });
      requestAnimationFrame(move);
    };
    move();
  }, [velocity]);

  // Touch control
  useEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  const handleTouch = (e) => {
    const rect = container.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;

    setPlayerPos(
      Math.min(
        Math.max(touchX - bucketWidth / 2, 0),
        containerWidth - bucketWidth
      )
    );
  };

  container.addEventListener("touchmove", handleTouch);

  return () => {
    container.removeEventListener("touchmove", handleTouch);
  };
}, []);

  const triggerConfetti = useCallback(() => {
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
  }, []);

  // Handle catching drops
  const handleCatch = useCallback(
    (drop) => {
      setSparkles((prev) => [...prev, { x: drop.xPos, y: drop.yPos, id: Date.now() }]);
      setCatching(true);
      setTimeout(() => setCatching(false), 150);

      if (drop.type === "rainbow") {
        setDrops((prev) => prev.map((d) => ({ ...d, speed: d.speed / 2 })));
        setTimeout(() => setDrops((prev) => prev.map((d) => ({ ...d, speed: d.speed * 2 }))), 5000);
      }

      setScore((prev) => prev + drop.points);
      if ((score + drop.points) % 100 === 0 && score + drop.points !== 0) triggerConfetti();
    },
    [score, triggerConfetti]
  );

  // Spawn drops
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      const spawnPowerUp = Math.random() < 0.05 ? POWERUPS[Math.floor(Math.random() * POWERUPS.length)] : null;
      const drop = {
        id: Date.now() + Math.random(),
        xPos: Math.random() * (containerWidth - 30),
        yPos: 0,
        speed: 2 + Math.random() * 3,
        color: spawnPowerUp ? spawnPowerUp.color : randomColor.color,
        points: spawnPowerUp ? spawnPowerUp.points : randomColor.points,
        type: spawnPowerUp ? spawnPowerUp.type : randomColor.type,
      };
      setDrops((prev) => [...prev, drop]);
    }, 600 - level * 50);
    return () => clearInterval(interval);
  }, [level, gameOver]);

  // Move drops & collision
  useEffect(() => {
    if (gameOver) return;
    const moveInterval = setInterval(() => {
      setDrops((prev) =>
        prev
          .map((drop) => ({ ...drop, yPos: drop.yPos + drop.speed }))
          .filter((drop) => {
            if (
              drop.yPos + 30 >= 450 &&
              drop.xPos + 30 >= playerPos &&
              drop.xPos <= playerPos + bucketWidth
            ) {
              handleCatch(drop);
              return false;
            }
            if (drop.yPos > 480) return false;
            return true;
          })
      );
    }, 30);
    return () => clearInterval(moveInterval);
  }, [playerPos, bucketWidth, handleCatch, gameOver]);

  // Level up & max level check
  useEffect(() => {
    const newLevel = Math.floor(score / 100) + 1;
    setLevel(newLevel);
    if (newLevel > MAX_LEVEL) setGameOver(true);
  }, [score]);

  // Game over if score < 0
  useEffect(() => { if (score < 0) setGameOver(true); }, [score]);

  // Save top scores
  useEffect(() => {
    if (gameOver) {
      setQuote(HOLI_QUOTES[Math.floor(Math.random() * HOLI_QUOTES.length)]); // pick random quote
      const newTopScores = [...topScores, score].sort((a, b) => b - a).slice(0, 5);
      setTopScores(newTopScores);
      localStorage.setItem("holiTopScores", JSON.stringify(newTopScores));
    }
  }, [gameOver, score, topScores]);

  const handleRestart = () => {
    setScore(0);
    setLevel(1);
    setDrops([]);
    setGameOver(false);
  };

  return (
    <>
      <ParticleBackground level={level} />
      <Container
        className="position-relative mt-3"
        style={{
          width: "90%",
          maxWidth: "500px",
          height: "500px",
          border: "5px solid #ff4d6d",
          borderRadius: "15px",
          overflow: "hidden",
          marginBottom: "50px",
          zIndex: 2,
          backgroundColor: "rgba(255,255,255,0.1)",
          boxShadow: "inset 0 0 15px rgba(255,77,109,0.3), 0 0 30px rgba(255,77,109,0.5)",
        }}
        ref={containerRef}
      >
        {drops.map((drop) => (
          <ColorDrop key={drop.id} color={drop.color} xPos={drop.xPos} yPos={drop.yPos} />
        ))}

        <PlayerBucket xPos={playerPos} catching={catching} />

        {/* Sparkles */}
        {sparkles.map((s) => (
          <div
            key={s.id}
            style={{
              position: "absolute",
              top: s.y,
              left: s.x,
              width: "15px",
              height: "15px",
              background: "radial-gradient(circle, #fff, #ffd700)",
              borderRadius: "50%",
              boxShadow: "0 0 10px #ffd700, 0 0 20px #ff4d6d",
              animation: "sparkle 0.5s ease-out",
              pointerEvents: "none",
            }}
          ></div>
        ))}

        {/* Top bar */}
        <div className="d-flex justify-content-between align-items-center p-2 bg-light position-absolute w-100" style={{ top: 0 }}>
          <h5 style={{ marginLeft: "10px" }}>Level: {level}</h5>
          <div className="d-flex align-items-center">
            <h5 style={{ marginRight: "10px" }}>Score: {score}</h5>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setGameOver(true)}
              style={{ fontWeight: "bold", textShadow: "1px 1px 2px #8338ec" }}
            >
              Quit Game
            </Button>
          </div>
        </div>

        {/* Game Over Modal */}
        <Modal
          show={gameOver}
          onHide={() => {}}
          centered
          style={{ backdropFilter: "blur(5px)" }}
        >
          <Modal.Header
            style={{
              background: "linear-gradient(90deg, #ff4d6d, #ffbe0b)",
              color: "#fff",
              borderBottom: "2px solid #8338ec",
            }}
          >
            <Modal.Title>Game Over 🎉</Modal.Title>
          </Modal.Header>
          <Modal.Body
            style={{
              background: "#fff3e6",
              borderRadius: "0 0 10px 10px",
              color: "#333",
              fontWeight: "500",
            }}
          >
            {/* Random Holi Quote */}
            <p style={{ fontStyle: "italic", color: "#8338ec", marginBottom: "10px", fontSize: "1.1rem" }}>
              "{quote}"
            </p>
            <p>Your final score: {score}</p>
            <h6>Top Scores:</h6>
            <ol>
              {topScores.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </Modal.Body>
          <Modal.Footer
            style={{ background: "#fff3e6", borderTop: "2px solid #ff4d6d" }}
          >
            <Button
              variant="warning"
              onClick={handleRestart}
              style={{
                fontWeight: "bold",
                color: "#fff",
                textShadow: "1px 1px 2px #8338ec",
                transition: "transform 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              Restart
            </Button>
            <Button
              variant="info"
              onClick={() => {
                const shareUrl = `https://tanishka-holi-game.vercel.app`;
                window.open(shareUrl, "_blank");
              }}
              style={{
                fontWeight: "bold",
                color: "#fff",
                textShadow: "1px 1px 2px #8338ec",
                transition: "transform 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              Share on LinkedIn
            </Button>
            <Button
              variant="danger"
              onClick={() => window.location.reload()}
              style={{
                fontWeight: "bold",
                color: "#fff",
                textShadow: "1px 1px 2px #8338ec",
                transition: "transform 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              Quit Game
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
}