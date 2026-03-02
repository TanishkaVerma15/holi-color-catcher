import React, { useState, useEffect, useRef } from "react";
import PlayerBucket from "./PlayerBucket";
import ColorDrop from "./ColorDrop";
import ParticleBackground from "./ParticleBackground";
import confetti from "canvas-confetti";
import { Container, Modal, Button } from "react-bootstrap";
import "../styles/Holi.css";

const COLORS = [
  { color: "#ff4d6d", points: 10 },
  { color: "#ffbe0b", points: 15 },
  { color: "#8338ec", points: 20 },
  { color: "#3a86ff", points: -5 },
];

const HOLI_QUOTES = [
  "Let the colors of Holi spread joy and positivity 🌈",
  "Play with colors, play with happiness 💛",
  "Holi hai! Catch the colors of joy 🎉",
];

export default function GameContainer() {
  const [playerPos, setPlayerPos] = useState(200);
  const [drops, setDrops] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [quote, setQuote] = useState("");
  const [topScores, setTopScores] = useState(
    () => JSON.parse(localStorage.getItem("holiTopScores")) || []
  );

  const containerRef = useRef();
  const animationRef = useRef();
  const spawnTimer = useRef();

  const containerWidth = 500;
  const bucketWidth = 80;

  /* -------- SMOOTH PLAYER MOVEMENT -------- */

  useEffect(() => {
    let velocity = 0;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") velocity = -8;
      if (e.key === "ArrowRight") velocity = 8;
    };

    const handleKeyUp = () => (velocity = 0);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const move = () => {
      setPlayerPos((pos) => {
        let newPos = pos + velocity;
        if (newPos < 0) newPos = 0;
        if (newPos > containerWidth - bucketWidth)
          newPos = containerWidth - bucketWidth;
        return newPos;
      });
      animationRef.current = requestAnimationFrame(move);
    };

    move();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  /* -------- TOUCH CONTROL -------- */

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
    return () => container.removeEventListener("touchmove", handleTouch);
  }, []);

  /* -------- LEVEL SYSTEM -------- */

  useEffect(() => {
    setLevel(Math.floor(score / 120) + 1);
  }, [score]);

  /* -------- SPAWN DROPS -------- */

  useEffect(() => {
    if (gameOver) return;

    const spawnRate = Math.max(900 - level * 120, 300);
    const speedBase = 1.5 + level * 0.4;

    spawnTimer.current = setInterval(() => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];

      const drop = {
        id: Date.now() + Math.random(),
        xPos: Math.random() * (containerWidth - 30),
        yPos: 0,
        speed: speedBase + Math.random(),
        color: color.color,
        points: color.points,
      };

      setDrops((prev) => [...prev, drop]);
    }, spawnRate);

    return () => clearInterval(spawnTimer.current);
  }, [level, gameOver]);

  /* -------- DROP MOVEMENT -------- */

  useEffect(() => {
    if (gameOver) return;

    const animate = () => {
      setDrops((prev) =>
        prev
          .map((drop) => ({
            ...drop,
            yPos: drop.yPos + drop.speed,
          }))
          .filter((drop) => {
            if (
              drop.yPos + 30 >= 450 &&
              drop.xPos + 30 >= playerPos &&
              drop.xPos <= playerPos + bucketWidth
            ) {
              setScore((s) => s + drop.points);
              confetti({ particleCount: 40, spread: 50 });
              return false;
            }
            if (drop.yPos > 480) return false;
            return true;
          })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationRef.current);
  }, [playerPos, gameOver]);

  /* -------- GAME OVER -------- */

  useEffect(() => {
    if (score < 0) setGameOver(true);
  }, [score]);

  useEffect(() => {
    if (!gameOver) return;

    setQuote(HOLI_QUOTES[Math.floor(Math.random() * HOLI_QUOTES.length)]);
    const newScores = [...topScores, score].sort((a, b) => b - a).slice(0, 5);
    setTopScores(newScores);
    localStorage.setItem("holiTopScores", JSON.stringify(newScores));
  }, [gameOver]);

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
        ref={containerRef}
        className="position-relative mt-3"
        style={{
          width: "90%",
          maxWidth: "500px",
          height: "500px",
          border: "5px solid #ff4d6d",
          borderRadius: "15px",
          overflow: "hidden",
          background: "rgba(255,255,255,0.1)",
        }}
      >
        {drops.map((drop) => (
          <ColorDrop
            key={drop.id}
            color={drop.color}
            xPos={drop.xPos}
            yPos={drop.yPos}
          />
        ))}

        <PlayerBucket xPos={playerPos} />

        {/* TOP BAR */}
        <div className="d-flex justify-content-between p-2 bg-light position-absolute w-100">
          <h5>Level: {level}</h5>
          <div>
            <span className="me-3">Score: {score}</span>
            <Button size="sm" variant="danger" onClick={() => setGameOver(true)}>
              Quit
            </Button>
          </div>
        </div>

        {/* GAME OVER MODAL */}
        <Modal show={gameOver} centered>
          <Modal.Header>
            <Modal.Title>Game Over 🎉</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p>"{quote}"</p>
            <h5>Score: {score}</h5>
            <h6>Top Scores</h6>
            <ol>
              {topScores.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="warning" onClick={handleRestart}>
              Restart
            </Button>

            <Button variant="danger" onClick={() => window.location.reload()}>
              Quit Game
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
}