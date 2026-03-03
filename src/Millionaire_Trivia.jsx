import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { buildGameQuestions } from "./questionBank.js";
import { getProgress, saveGameResult } from "./progressTracker.js";

// ---- Constants ----

const COIN_LADDER = [
  { level: 1,  coins: 100,       safe: false },
  { level: 2,  coins: 500,       safe: false },
  { level: 3,  coins: 1000,      safe: true  },
  { level: 4,  coins: 5000,      safe: false },
  { level: 5,  coins: 10000,     safe: false },
  { level: 6,  coins: 25000,     safe: true  },
  { level: 7,  coins: 50000,     safe: false },
  { level: 8,  coins: 100000,    safe: false },
  { level: 9,  coins: 250000,    safe: true  },
  { level: 10, coins: 1000000,   safe: false },
];

const SUBJECT_COLORS = {
  Math: "#FF6B6B",
  Science: "#51CF66",
  History: "#FFD43B",
  Civics: "#74C0FC",
  Reading: "#F783AC",
};

const SUBJECT_EMOJIS = {
  Math: "🔢",
  Science: "🌱",
  History: "🏛️",
  Civics: "🏙️",
  Reading: "📚",
};

// Hari fills these in — shown on correct-answer celebration
const DAD_MESSAGES = [
  "Amazing Madhav! 🌟",
  "That's my boy! 🧠",
  "Amma would be so proud!",
  "You're on fire! 🔥",
  "Adipoli! Keep going!",
];

// ---- Helpers ----

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Adaptive AI slot config: [aiCount, slotIndices (0-based), difficulty label]
function getAIConfig(gamesPlayed) {
  if (gamesPlayed >= 31) return { count: 8, slots: [2, 3, 4, 5, 6, 7, 8, 9] };
  if (gamesPlayed >= 16) return { count: 6, slots: [4, 5, 6, 7, 8, 9] };
  if (gamesPlayed >= 6)  return { count: 4, slots: [6, 7, 8, 9] };
  return                        { count: 2, slots: [6, 7] };
}

async function fetchAIQuestion(subject) {
  try {
    const res = await fetch("/api/ask-claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, difficulty: "hard" }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ---- Sound Engine (Web Audio API, no files needed) ----

function playSound(type) {
  try {
    const ctx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
    const note = (freq, start, dur, wave = "sine", vol = 0.25) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = wave;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.01);
    };
    if (type === "checkpoint") {
      [[329.63,0],[415.3,0.18],[493.88,0.36],[659.25,0.54]].forEach(([f,t]) => note(f,t,0.5));
    } else if (type === "correct") {
      note(523.25, 0, 0.15); note(659.25, 0.15, 0.3);
    } else if (type === "correct_checkpoint") {
      [[261.63,0],[329.63,0.1],[392,0.2],[523.25,0.3],[659.25,0.4],[783.99,0.5]].forEach(([f,t]) => note(f,t,0.55));
    } else if (type === "wrong") {
      note(220, 0, 0.3, "sawtooth", 0.2); note(180, 0.25, 0.5, "sawtooth", 0.15);
    }
    setTimeout(() => ctx.close(), 3000);
  } catch {
    // Audio playback not supported — intentionally ignored
  }
}

// Stable coin IDs — avoids using array index as React key
const COIN_ITEMS = Array.from({ length: 20 }, (_, i) => ({ id: i }));

// Pure style helpers — outside component to reduce cognitive complexity
function getOptionStyle(option, { eliminatedOptions, selectedAnswer, answerState, answer }) {
  const isEliminated = eliminatedOptions.includes(option);
  const isSelected = selectedAnswer === option;
  const isCorrect = answerState === "correct" && isSelected;
  const isWrong = answerState === "wrong" && isSelected;
  const showCorrect = answerState === "wrong" && option === answer;

  let bg = "rgba(255,255,255,0.05)";
  let border = "2px solid rgba(255,255,255,0.15)";
  let color = "white";
  const opacity = isEliminated ? 0.2 : 1;

  if (isCorrect || showCorrect) { bg = "rgba(81,207,102,0.25)"; border = "2px solid #51CF66"; color = "#51CF66"; }
  else if (isWrong) { bg = "rgba(255,107,107,0.25)"; border = "2px solid #FF6B6B"; color = "#FF6B6B"; }
  else if (isSelected) { bg = "rgba(255,212,75,0.15)"; border = "2px solid #FFD43B"; }

  return {
    background: bg, border, color, opacity,
    borderRadius: 16, padding: "1rem 1.2rem",
    fontFamily: "'Fredoka One', cursive", fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
    cursor: isEliminated || answerState ? "default" : "pointer",
    transition: "all 0.3s", width: "100%", textAlign: "left",
    display: "flex", alignItems: "center", gap: "0.75rem",
    pointerEvents: isEliminated || answerState ? "none" : "auto"
  };
}

function getLadderBg(index, currentQ) {
  if (index === currentQ) return "#FFD43B";
  if (index < currentQ) return "rgba(81,207,102,0.3)";
  return "rgba(255,255,255,0.05)";
}

function getLadderColor(index, currentQ) {
  if (index === currentQ) return "#1a1a2e";
  if (index < currentQ) return "#51CF66";
  return "#888";
}

function getMotivationalMessage(correct) {
  if (correct === 10) return "PERFECT GAME! You're a genius! 🧠";
  if (correct >= 7)   return "Amazing work Madhav! 🌟";
  if (correct >= 4)   return "Great effort! Keep practicing! 💪";
  return "Good try! You'll do better next time! 🎯";
}

// ---- Components ----

function CheckpointBanner() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "0.6rem",
      background: "linear-gradient(135deg, rgba(255,100,0,0.2), rgba(255,212,75,0.25))",
      border: "2px solid #FFA94D", borderRadius: 50,
      padding: "0.45rem 1.5rem", marginBottom: "0.75rem",
      animation: "checkpointPulse 0.8s ease-in-out infinite",
    }}>
      <span style={{ fontSize: "1.3rem" }}>🔥</span>
      <span style={{ fontFamily: "'Fredoka One', cursive", color: "#FFD43B", fontSize: "1.05rem", letterSpacing: 2 }}>
        MILESTONE QUESTION — LOCK IT IN!
      </span>
      <span style={{ fontSize: "1.3rem" }}>🔥</span>
    </div>
  );
}

function CoinBurst({ show }) {
  if (!show) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 999 }}>
      {COIN_ITEMS.map((coin) => (
        <div key={coin.id} style={{
          position: "absolute",
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 60}%`,
          fontSize: `${1.5 + Math.random() * 2}rem`,
          animation: `coinFall ${0.8 + Math.random() * 1.2}s ease-out forwards`,
          animationDelay: `${Math.random() * 0.5}s`,
        }}>🪙</div>
      ))}
    </div>
  );
}
CoinBurst.propTypes = { show: PropTypes.bool.isRequired };

// ---- Geek Mascot ----
// Drawn entirely with HTML/CSS divs — no images, no SVG files
function GeekMascot({ state }) {
  const animations = {
    idle:     "mascotFloat 3s ease-in-out infinite",
    correct:  "mascotJump 0.5s ease-out infinite alternate",
    wrong:    "mascotShake 0.15s ease-in-out infinite",
    thinking: "mascotPulse 1.5s ease-in-out infinite",
  };
  const eyeExpressions = {
    idle:     { transform: "none" },
    correct:  { transform: "scaleY(0.3)", borderRadius: "0 0 50% 50%" }, // happy squint
    wrong:    { transform: "scaleY(1.2) rotate(5deg)" },                  // worried wide
    thinking: { transform: "scaleY(0.8)" },
  };
  const mouthShapes = {
    idle:     { width: 18, height: 9, borderRadius: "0 0 9px 9px", background: "#c0392b", border: "2px solid #922b21" },
    correct:  { width: 26, height: 14, borderRadius: "0 0 14px 14px", background: "#c0392b", border: "2px solid #922b21" },
    wrong:    { width: 18, height: 9, borderRadius: "9px 9px 0 0", background: "#c0392b", border: "2px solid #922b21" },
    thinking: { width: 14, height: 8, borderRadius: 4, background: "#c0392b", border: "2px solid #922b21" },
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      animation: animations[state] || animations.idle,
      transition: "all 0.3s ease",
      userSelect: "none",
    }}>
      {/* Stars on correct */}
      {state === "correct" && (
        <div style={{ position: "relative", width: 80, height: 20, marginBottom: 4 }}>
          {["⭐","⭐","⭐"].map((s, i) => (
            <span key={i} style={{
              position: "absolute", fontSize: "0.9rem",
              left: `${i * 30}%`, top: 0,
              animation: `starPop 0.4s ease-out ${i * 0.1}s both`,
            }}>{s}</span>
          ))}
        </div>
      )}

      {/* Head */}
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: "linear-gradient(135deg, #FDDCB5, #F5A623)",
        border: "3px solid #E8901A",
        position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}>
        {/* Rosy cheeks */}
        <div style={{ position: "absolute", left: 6, top: 38, width: 14, height: 8, borderRadius: "50%", background: "rgba(255,100,100,0.35)" }} />
        <div style={{ position: "absolute", right: 6, top: 38, width: 14, height: 8, borderRadius: "50%", background: "rgba(255,100,100,0.35)" }} />

        {/* Glasses frame */}
        <div style={{ position: "absolute", top: 22, display: "flex", alignItems: "center", gap: 4 }}>
          {/* Left lens */}
          <div style={{
            width: 22, height: 16, borderRadius: 4,
            border: "3px solid #333", background: "rgba(173,216,230,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {/* Left eye */}
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#333", ...eyeExpressions[state],
              transition: "transform 0.3s",
            }} />
          </div>
          {/* Bridge */}
          <div style={{ width: 6, height: 2, background: "#333", borderRadius: 1 }} />
          {/* Right lens */}
          <div style={{
            width: 22, height: 16, borderRadius: 4,
            border: "3px solid #333", background: "rgba(173,216,230,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {/* Right eye */}
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#333", ...eyeExpressions[state],
              transition: "transform 0.3s",
            }} />
          </div>
        </div>

        {/* Mouth */}
        <div style={{
          position: "absolute", bottom: 14, left: "50%",
          transform: "translateX(-50%)",
          transition: "all 0.3s",
          ...mouthShapes[state],
        }} />

        {/* Thinking hand (chin scratch) */}
        {state === "thinking" && (
          <div style={{
            position: "absolute", bottom: -10, right: -8,
            fontSize: "1.1rem",
            animation: "thinkingTap 1s ease-in-out infinite",
          }}>✋</div>
        )}
      </div>

      {/* Bowtie */}
      <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
        <div style={{ width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderRight: "10px solid #E74C3C" }} />
        <div style={{ width: 8, height: 8, background: "#C0392B", borderRadius: "50%" }} />
        <div style={{ width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderLeft: "10px solid #E74C3C" }} />
      </div>

      {/* Emoji label */}
      <div style={{ fontSize: "1.4rem", marginTop: 2 }}>🤓</div>
    </div>
  );
}
GeekMascot.propTypes = { state: PropTypes.string.isRequired };

// ---- Streak Counter ----
function StreakCounter({ streak }) {
  if (streak < 2) return null;
  return (
    <div style={{
      marginTop: "0.75rem",
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "streakBounce 0.4s cubic-bezier(0.36,0.07,0.19,0.97)",
    }}>
      <span style={{
        background: "linear-gradient(135deg, rgba(255,107,107,0.2), rgba(255,169,77,0.2))",
        border: "2px solid #FF6B6B", borderRadius: 50,
        padding: "0.4rem 1.2rem",
        fontFamily: "'Fredoka One', cursive", fontSize: "1rem",
        color: "#FF6B6B", letterSpacing: 1,
      }}>
        🔥 {streak} in a row!
      </span>
    </div>
  );
}
StreakCounter.propTypes = { streak: PropTypes.number.isRequired };

// ---- Dad Message overlay ----
function DadMessage({ message }) {
  if (!message) return null;
  return (
    <div style={{
      position: "fixed", bottom: "2rem", left: "50%", transform: "translateX(-50%)",
      zIndex: 200, pointerEvents: "none",
      animation: "dadMsgSlideUp 0.4s cubic-bezier(0.22,1,0.36,1) both",
    }}>
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e, #16213e)",
        border: "2px solid #FFD43B", borderRadius: 50,
        padding: "0.6rem 1.8rem",
        fontFamily: "'Fredoka One', cursive", fontSize: "1.1rem",
        color: "#FFD43B", whiteSpace: "nowrap",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      }}>
        {message}
      </div>
    </div>
  );
}
DadMessage.propTypes = { message: PropTypes.string };
DadMessage.defaultProps = { message: null };

// ---- Personal Best Banner ----
function PersonalBestBanner({ show }) {
  if (!show) return null;
  return (
    <div style={{
      animation: "shimmer 1.5s linear infinite, slideIn 0.4s ease-out",
      background: "linear-gradient(90deg, rgba(255,212,75,0.1) 0%, rgba(255,212,75,0.3) 50%, rgba(255,212,75,0.1) 100%)",
      backgroundSize: "200% 100%",
      border: "2px solid #FFD43B", borderRadius: 50,
      padding: "0.4rem 1.5rem", marginBottom: "0.6rem",
      fontFamily: "'Fredoka One', cursive", fontSize: "0.95rem",
      color: "#FFD43B", textAlign: "center",
    }}>
      🏆 New Personal Best!
    </div>
  );
}
PersonalBestBanner.propTypes = { show: PropTypes.bool.isRequired };

// ---- Ask Parent Modal ----
function AskParentModal({ onResume }) {
  const [timer, setTimer] = useState(60);
  const [phase, setPhase] = useState("calling"); // calling -> waiting -> done

  useEffect(() => {
    const t = setTimeout(() => setPhase("waiting"), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "waiting") return;
    if (timer <= 0) { setPhase("done"); return; }
    const t = setTimeout(() => setTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, phase]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
    }}>
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e, #16213e)",
        border: "3px solid #FFD43B",
        borderRadius: 24, padding: "2.5rem", maxWidth: 380, width: "90%",
        textAlign: "center", color: "white"
      }}>
        {phase === "calling" && (
          <>
            <div style={{ fontSize: "4rem", animation: "ring 0.5s infinite alternate" }}>📞</div>
            <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: "1.8rem", color: "#FFD43B", margin: "1rem 0 0.5rem" }}>
              Calling Mom or Dad!
            </h2>
            <p style={{ color: "#aaa", fontSize: "1rem" }}>Go find them quickly! 🏃</p>
          </>
        )}
        {phase === "waiting" && (
          <>
            <div style={{ fontSize: "3.5rem" }}>👨‍👩‍👦</div>
            <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: "1.6rem", color: "#FFD43B", margin: "1rem 0 0.5rem" }}>
              Ask Mom or Dad!
            </h2>
            <p style={{ color: "#ccc", margin: "0.5rem 0 1.5rem", fontSize: "0.95rem" }}>
              Show them the question and get their help!
            </p>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              border: "5px solid #FFD43B",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.5rem",
              background: timer < 15 ? "rgba(255,100,100,0.2)" : "rgba(255,212,75,0.1)",
              fontSize: "2rem", fontFamily: "'Fredoka One', cursive",
              color: timer < 15 ? "#FF6B6B" : "#FFD43B"
            }}>
              {timer}
            </div>
            <button onClick={onResume} style={{
              background: "#51CF66", border: "none", borderRadius: 50, padding: "0.8rem 2rem",
              fontFamily: "'Fredoka One', cursive", fontSize: "1.1rem", color: "white", cursor: "pointer"
            }}>
              Got the Answer! ✅
            </button>
          </>
        )}
        {phase === "done" && (
          <>
            <div style={{ fontSize: "3.5rem" }}>⏰</div>
            <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: "1.6rem", color: "#FF6B6B", margin: "1rem 0 0.5rem" }}>
              Time's Up!
            </h2>
            <p style={{ color: "#ccc", margin: "0.5rem 0 1.5rem" }}>Hope you got some help! Make your best guess!</p>
            <button onClick={onResume} style={{
              background: "#FFD43B", border: "none", borderRadius: 50, padding: "0.8rem 2rem",
              fontFamily: "'Fredoka One', cursive", fontSize: "1.1rem", color: "#1a1a2e", cursor: "pointer"
            }}>
              Back to Game!
            </button>
          </>
        )}
      </div>
    </div>
  );
}
AskParentModal.propTypes = { onResume: PropTypes.func.isRequired };

// ---- Game Over Screen ----
function GameOver({ won, coins, correct, bestStreakThisGame, onRestart }) {
  const progress = getProgress();
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      fontFamily: "'Fredoka One', cursive", flexDirection: "column", textAlign: "center", padding: "2rem"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700&display=swap');
        @keyframes slideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>{won ? "🏆" : "😢"}</div>
      <h1 style={{ fontSize: "2.5rem", color: won ? "#FFD43B" : "#FF6B6B", marginBottom: "0.5rem" }}>
        {won ? "YOU DID IT, MADHAV!" : "Oops! Better luck next time!"}
      </h1>
      <p style={{ color: "#aaa", fontFamily: "'Nunito', sans-serif", fontSize: "1rem", marginBottom: "1.5rem", fontStyle: "italic" }}>
        {getMotivationalMessage(correct)}
      </p>

      {/* Stats grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem",
        width: "100%", maxWidth: 380, marginBottom: "2rem",
        animation: "slideIn 0.5s ease-out",
      }}>
        {[
          { icon: "🪙", label: "Coins earned", value: coins.toLocaleString() },
          { icon: "🏆", label: "High score",   value: progress.highScore.toLocaleString() },
          { icon: "🔥", label: "Best streak",  value: `${bestStreakThisGame} in a row` },
          { icon: "📊", label: "Accuracy",     value: `${correct}/10 correct` },
          { icon: "🎮", label: "Total games",  value: progress.gamesPlayed },
        ].map(({ icon, label, value }) => (
          <div key={label} style={{
            background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: "0.85rem 1rem",
            border: "1px solid rgba(255,255,255,0.1)",
          }}>
            <div style={{ fontSize: "1.5rem" }}>{icon}</div>
            <div style={{ color: "#FFD43B", fontSize: "1.1rem", margin: "0.2rem 0 0.1rem" }}>{value}</div>
            <div style={{ color: "#777", fontFamily: "'Nunito', sans-serif", fontSize: "0.75rem" }}>{label}</div>
          </div>
        ))}
      </div>

      <button onClick={onRestart} style={{
        background: "linear-gradient(135deg, #FFD43B, #FFA94D)",
        border: "none", borderRadius: 50, padding: "1rem 2.5rem",
        fontFamily: "'Fredoka One', cursive", fontSize: "1.3rem", color: "#1a1a2e",
        cursor: "pointer", boxShadow: "0 4px 20px rgba(255,212,75,0.4)",
        transform: "scale(1)", transition: "transform 0.2s"
      }}
        onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
        onMouseLeave={e => e.target.style.transform = "scale(1)"}
      >
        Play Again! 🎮
      </button>
    </div>
  );
}
GameOver.propTypes = {
  won: PropTypes.bool.isRequired,
  coins: PropTypes.number.isRequired,
  correct: PropTypes.number.isRequired,
  bestStreakThisGame: PropTypes.number.isRequired,
  onRestart: PropTypes.func.isRequired,
};

// ---- Main Game ----

export default function MillionaireTrivia() {
  const [screen, setScreen] = useState("intro"); // intro | game | gameover
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerState, setAnswerState] = useState(null); // null | correct | wrong
  const [eliminatedOptions, setEliminatedOptions] = useState([]);
  const [lifelinesUsed, setLifelinesUsed] = useState({ fifty: false, parent: false });
  const [showParentModal, setShowParentModal] = useState(false);
  const [coins, setCoins] = useState(0);
  const [showBurst, setShowBurst] = useState(false);
  const [won, setWon] = useState(false);
  // Mascot & encouragement state
  const [mascotState, setMascotState] = useState("idle");
  const [streak, setStreak] = useState(0);
  const [bestStreakThisGame, setBestStreakThisGame] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [dadMessage, setDadMessage] = useState(null);
  const [isPersonalBest, setIsPersonalBest] = useState(false);

  const startGame = () => {
    const initial = buildGameQuestions();
    setQuestions(initial);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setAnswerState(null);
    setEliminatedOptions([]);
    setLifelinesUsed({ fifty: false, parent: false });
    setCoins(0);
    setWon(false);
    setMascotState("idle");
    setStreak(0);
    setBestStreakThisGame(0);
    setCorrectCount(0);
    setDadMessage(null);
    setIsPersonalBest(false);
    setScreen("game");

    // Feature 2: adaptive AI swap — background fetch, fail silently
    const { gamesPlayed } = getProgress();
    const { slots } = getAIConfig(gamesPlayed);
    const subjects = slots.map(i => initial[i]?.subject || "Math");
    Promise.all(subjects.map(subject => fetchAIQuestion(subject))).then(results => {
      setQuestions(prev => {
        const updated = [...prev];
        slots.forEach((slot, i) => {
          if (results[i]) updated[slot] = results[i];
        });
        return updated;
      });
    }).catch(() => {});
  };

  const q = questions[currentQ];
  const isCheckpoint = COIN_LADDER[currentQ]?.safe === true;

  // Play fanfare when landing on a checkpoint question
  useEffect(() => {
    if (screen === "game" && isCheckpoint) playSound("checkpoint");
  }, [currentQ, screen, isCheckpoint]);

  const resolveCorrect = () => {
    const newCoins = COIN_LADDER[currentQ].coins;
    const newStreak = streak + 1;
    const newBest = Math.max(bestStreakThisGame, newStreak);
    const newCorrect = correctCount + 1;
    const progress = getProgress();
    const isPB = newCoins > progress.highScore;

    playSound(isCheckpoint ? "correct_checkpoint" : "correct");
    setAnswerState("correct");
    setCoins(newCoins);
    setStreak(newStreak);
    setBestStreakThisGame(newBest);
    setCorrectCount(newCorrect);
    setMascotState("correct");
    setShowBurst(true);
    setIsPersonalBest(isPB);
    setDadMessage(DAD_MESSAGES[Math.floor(Math.random() * DAD_MESSAGES.length)]);

    setTimeout(() => { setShowBurst(false); setDadMessage(null); setIsPersonalBest(false); }, 2000);
    setTimeout(() => {
      setMascotState("idle");
      if (currentQ + 1 >= questions.length) {
        saveGameResult({ coinsEarned: newCoins, correct: newCorrect, total: questions.length, bestStreakThisGame: newBest });
        setWon(true);
        setScreen("gameover");
      } else {
        setCurrentQ(c => c + 1);
        setSelectedAnswer(null);
        setAnswerState(null);
        setEliminatedOptions([]);
      }
    }, 1800);
  };

  const resolveWrong = () => {
    const safeCoins = [...COIN_LADDER].slice(0, currentQ).reverse().find(l => l.safe)?.coins || 0;
    playSound("wrong");
    setAnswerState("wrong");
    setMascotState("wrong");
    setStreak(0);
    setTimeout(() => {
      saveGameResult({ coinsEarned: safeCoins, correct: correctCount, total: questions.length, bestStreakThisGame });
      setCoins(safeCoins);
      setWon(false);
      setScreen("gameover");
    }, 2000);
  };

  const handleAnswer = (option) => {
    if (selectedAnswer || answerState) return;
    setSelectedAnswer(option);
    setMascotState("thinking");
    setTimeout(() => {
      if (option === q.answer) resolveCorrect();
      else resolveWrong();
    }, 800);
  };

  const useFiftyFifty = () => {
    if (lifelinesUsed.fifty || answerState) return;
    const wrongs = q.options.filter(o => o !== q.answer);
    const toEliminate = shuffle(wrongs).slice(0, 2);
    setEliminatedOptions(toEliminate);
    setLifelinesUsed(l => ({ ...l, fifty: true }));
  };

  const useAskParent = () => {
    if (lifelinesUsed.parent || answerState) return;
    setLifelinesUsed(l => ({ ...l, parent: true }));
    setShowParentModal(true);
  };

  if (screen === "gameover") {
    return (
      <GameOver
        won={won}
        coins={coins}
        correct={correctCount}
        bestStreakThisGame={bestStreakThisGame}
        onRestart={() => setScreen("intro")}
      />
    );
  }

  if (screen === "intro") {
    const progress = getProgress();
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", textAlign: "center", padding: "2rem",
        fontFamily: "'Fredoka One', cursive"
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700&display=swap');
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
          @keyframes coinFall { 0%{opacity:1;transform:translateY(0) rotate(0deg)} 100%{opacity:0;transform:translateY(200px) rotate(360deg)} }
          @keyframes ring { 0%{transform:rotate(-15deg)} 100%{transform:rotate(15deg)} }
          @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,212,75,0.4)} 50%{box-shadow:0 0 0 20px rgba(255,212,75,0)} }
          @keyframes slideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          @keyframes glow { 0%,100%{text-shadow:0 0 20px rgba(255,212,75,0.5)} 50%{text-shadow:0 0 40px rgba(255,212,75,1)} }
          @keyframes mascotFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        `}</style>

        <div style={{ marginBottom: "1rem" }}>
          <GeekMascot state="idle" />
        </div>

        <div style={{ fontSize: "5rem", animation: "float 3s ease-in-out infinite" }}>🪙</div>
        <h1 style={{
          fontSize: "clamp(2rem, 6vw, 3.5rem)", color: "#FFD43B",
          margin: "1rem 0 0.25rem", animation: "glow 2s ease-in-out infinite",
          textShadow: "0 0 30px rgba(255,212,75,0.6)"
        }}>
          Madhav's
        </h1>
        <h2 style={{ fontSize: "clamp(1.2rem, 4vw, 2rem)", color: "white", margin: "0 0 0.5rem", letterSpacing: 2 }}>
          MILLION COIN CHALLENGE
        </h2>
        <p style={{ color: "#9b8ec4", fontFamily: "'Nunito', sans-serif", fontSize: "1rem", maxWidth: 300, marginBottom: "1rem" }}>
          10 questions. 2 lifelines. Can you win 1,000,000 🪙?
        </p>

        {/* Personal stats on intro if games played */}
        {progress.gamesPlayed > 0 && (
          <div style={{
            display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap", justifyContent: "center",
            animation: "slideIn 0.5s ease-out",
          }}>
            <span style={{ background: "rgba(255,212,75,0.1)", border: "1px solid #FFD43B", borderRadius: 50, padding: "0.3rem 0.9rem", color: "#FFD43B", fontFamily: "'Nunito', sans-serif", fontSize: "0.85rem" }}>
              🏆 Best: {progress.highScore.toLocaleString()} coins
            </span>
            <span style={{ background: "rgba(255,107,107,0.1)", border: "1px solid #FF6B6B", borderRadius: 50, padding: "0.3rem 0.9rem", color: "#FF6B6B", fontFamily: "'Nunito', sans-serif", fontSize: "0.85rem" }}>
              🎮 {progress.gamesPlayed} games played
            </span>
          </div>
        )}

        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
          {Object.entries(SUBJECT_EMOJIS).map(([s, e]) => (
            <div key={s} style={{
              background: "rgba(255,255,255,0.05)", border: `2px solid ${SUBJECT_COLORS[s]}`,
              borderRadius: 50, padding: "0.4rem 1rem", color: SUBJECT_COLORS[s],
              fontFamily: "'Nunito', sans-serif", fontSize: "0.9rem"
            }}>{e} {s}</div>
          ))}
        </div>
        <button onClick={startGame} style={{
          background: "linear-gradient(135deg, #FFD43B, #FFA94D)",
          border: "none", borderRadius: 50, padding: "1.1rem 3rem",
          fontFamily: "'Fredoka One', cursive", fontSize: "1.5rem", color: "#1a1a2e",
          cursor: "pointer", animation: "pulse 2s infinite",
          boxShadow: "0 8px 30px rgba(255,212,75,0.4)"
        }}>
          Let's Play! 🚀
        </button>
      </div>
    );
  }

  if (!q) return null;

  const subjectColor = SUBJECT_COLORS[q.subject] || "#FFD43B";
  const subjectBgRgb = subjectColor === "#FFD43B" ? "255,212,75" : "255,255,255";
  const optionStyleProps = { eliminatedOptions, selectedAnswer, answerState, answer: q.answer };
  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div style={{
      minHeight: "100vh",
      background: isCheckpoint
        ? "linear-gradient(135deg, #0a1a10, #0f2d1a, #1a3a22)"
        : "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      fontFamily: "'Fredoka One', cursive", color: "white",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "1.5rem 1rem",
      transition: "background 0.6s ease"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes coinFall { 0%{opacity:1;transform:translateY(0) rotate(0deg)} 100%{opacity:0;transform:translateY(200px) rotate(360deg)} }
        @keyframes ring { 0%{transform:rotate(-15deg)} 100%{transform:rotate(15deg)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes correctPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.02)} }
        @keyframes checkpointPulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,169,77,0.6)} 50%{box-shadow:0 0 0 18px rgba(255,169,77,0)} }
        @keyframes rainbowBorder {
          0%{border-color:#FFA94D;box-shadow:0 0 30px rgba(255,169,77,0.4)}
          25%{border-color:#FFD43B;box-shadow:0 0 30px rgba(255,212,75,0.4)}
          50%{border-color:#51CF66;box-shadow:0 0 30px rgba(81,207,102,0.4)}
          75%{border-color:#74C0FC;box-shadow:0 0 30px rgba(116,192,252,0.4)}
          100%{border-color:#FFA94D;box-shadow:0 0 30px rgba(255,169,77,0.4)}
        }
        @keyframes mascotFloat  { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-8px)} }
        @keyframes mascotJump   { 0%{transform:translateY(0) scale(1)} 100%{transform:translateY(-14px) scale(1.05)} }
        @keyframes mascotShake  { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
        @keyframes mascotPulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        @keyframes starPop      { 0%{opacity:0;transform:scale(0) rotate(-20deg)} 100%{opacity:1;transform:scale(1) rotate(0deg)} }
        @keyframes thinkingTap  { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-15deg)} }
        @keyframes streakBounce { 0%{transform:scale(0.5)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }
        @keyframes dadMsgSlideUp{ from{opacity:0;transform:translate(-50%,20px)} to{opacity:1;transform:translate(-50%,0)} }
        @keyframes shimmer      { 0%{background-position:200% center} 100%{background-position:-200% center} }
      `}</style>

      <CoinBurst show={showBurst} />
      <DadMessage message={dadMessage} />
      {showParentModal && <AskParentModal onResume={() => setShowParentModal(false)} />}
      {isCheckpoint && <CheckpointBanner />}
      <PersonalBestBanner show={isPersonalBest} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: 600, marginBottom: "1rem" }}>
        <div style={{ fontSize: "1.1rem", color: "#FFD43B" }}>🪙 {coins}</div>
        <div style={{ color: "#9b8ec4", fontSize: "0.9rem", fontFamily: "'Nunito', sans-serif" }}>
          Question {currentQ + 1} of {questions.length}
        </div>
        <div style={{
          background: `rgba(${subjectBgRgb},0.1)`,
          border: `1px solid ${subjectColor}`,
          borderRadius: 20, padding: "0.25rem 0.75rem",
          color: subjectColor, fontSize: "0.85rem"
        }}>
          {SUBJECT_EMOJIS[q.subject]} {q.subject}
        </div>
      </div>

      {/* Coin Ladder */}
      <div style={{
        display: "flex", gap: "0.4rem", marginBottom: "1.5rem",
        overflowX: "auto", width: "100%", maxWidth: 600, paddingBottom: "0.5rem"
      }}>
        {COIN_LADDER.map((l, i) => (
          <div key={l.level} style={{
            flex: "1 0 auto", minWidth: 44, height: 36,
            borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.7rem", fontFamily: "'Nunito', sans-serif",
            background: getLadderBg(i, currentQ),
            border: l.safe ? "2px solid #51CF66" : "1px solid rgba(255,255,255,0.1)",
            color: getLadderColor(i, currentQ),
            fontWeight: i === currentQ ? "bold" : "normal",
            transition: "all 0.3s"
          }}>
            {l.safe ? "🛡️" : `${l.coins}`}
          </div>
        ))}
      </div>

      {/* Question card + mascot row */}
      <div style={{ display: "flex", alignItems: "flex-start", width: "100%", maxWidth: 600, gap: "1rem", marginBottom: "1.25rem" }}>
        <div style={{ flex: 1 }}>
          <div style={{
            background: isCheckpoint ? "rgba(255,169,77,0.08)" : "rgba(255,255,255,0.05)",
            border: isCheckpoint ? "3px solid #FFA94D" : `2px solid ${subjectColor}`,
            borderRadius: 20, padding: "1.5rem",
            animation: isCheckpoint
              ? "rainbowBorder 2s linear infinite, slideIn 0.4s ease-out"
              : "slideIn 0.4s ease-out",
          }}>
            <p style={{ fontSize: "clamp(1.05rem, 3vw, 1.25rem)", margin: 0, lineHeight: 1.5, textAlign: "center" }}>
              {q.question}
            </p>
          </div>
        </div>
        {/* Mascot — hidden on very small screens via width check */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", paddingTop: "0.5rem" }}>
          <GeekMascot state={mascotState} />
        </div>
      </div>

      {/* Options */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", width: "100%", maxWidth: 600, marginBottom: "1.5rem" }}>
        {q.options.map((option, i) => (
          <button key={option} onClick={() => handleAnswer(option)} style={getOptionStyle(option, optionStyleProps)}>
            <span style={{
              minWidth: 28, height: 28, borderRadius: "50%",
              background: "rgba(255,255,255,0.1)", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: "0.85rem"
            }}>
              {optionLabels[i]}
            </span>
            {option}
          </button>
        ))}
      </div>

      {/* Lifelines */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <button onClick={useFiftyFifty} disabled={lifelinesUsed.fifty} style={{
          background: lifelinesUsed.fifty ? "rgba(255,255,255,0.05)" : "rgba(255,212,75,0.15)",
          border: `2px solid ${lifelinesUsed.fifty ? "rgba(255,255,255,0.1)" : "#FFD43B"}`,
          borderRadius: 50, padding: "0.6rem 1.25rem",
          fontFamily: "'Fredoka One', cursive", fontSize: "0.95rem",
          color: lifelinesUsed.fifty ? "#555" : "#FFD43B", cursor: lifelinesUsed.fifty ? "not-allowed" : "pointer",
          transition: "all 0.2s"
        }}>
          {lifelinesUsed.fifty ? "✂️ Used" : "✂️ 50/50"}
        </button>
        <button onClick={useAskParent} disabled={lifelinesUsed.parent} style={{
          background: lifelinesUsed.parent ? "rgba(255,255,255,0.05)" : "rgba(116,192,252,0.15)",
          border: `2px solid ${lifelinesUsed.parent ? "rgba(255,255,255,0.1)" : "#74C0FC"}`,
          borderRadius: 50, padding: "0.6rem 1.25rem",
          fontFamily: "'Fredoka One', cursive", fontSize: "0.95rem",
          color: lifelinesUsed.parent ? "#555" : "#74C0FC", cursor: lifelinesUsed.parent ? "not-allowed" : "pointer",
          transition: "all 0.2s"
        }}>
          {lifelinesUsed.parent ? "📞 Used" : "📞 Ask Parent"}
        </button>
      </div>

      {/* Streak counter */}
      <StreakCounter streak={streak} />
    </div>
  );
}
