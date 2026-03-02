import React, { useState } from "react";
import GameContainer from "./components/GameContainer";
import "bootstrap/dist/css/bootstrap.min.css";
import ParticleBackground from "./components/ParticleBackground";

function App() {
  const [startGame, setStartGame] = useState(false);

  return (
    <div style={{ minHeight: "100vh", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <ParticleBackground active={!startGame} />
      {!startGame ? (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "100vh", zIndex: 2, position: "relative" }}>
          <h1 style={{ color: "#fd1ec2", fontFamily: "cursive", fontSize: "3rem" }}>Throw colors🌸💜, spread smiles🕊️🌈, celebrate life😄🎉
            !"Happy Holi!"💛🎨</h1>
          <p style={{ fontSize: "1.5rem", color: "#fc1414" }}>Get ready to catch the colors with..
                                                                <b>S P E C T R U M - C A T C H E R! </b>🌈</p>
          <button
            className="btn btn-lg btn-warning mt-4"
            onClick={() => setStartGame(true)}
            style={{ fontWeight: "bold", animation: "pulse 1.5s infinite" }}
          >
            Start Game
          </button>
        </div>
      ) : (
        <GameContainer />
      )}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default App;