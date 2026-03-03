import { useState, useEffect, useRef } from "react";

const COIN_LADDER = [
  { level: 1,  coins: 100,       safe: false },
  { level: 2,  coins: 200,       safe: false },
  { level: 3,  coins: 500,       safe: true  },
  { level: 4,  coins: 1000,      safe: false },
  { level: 5,  coins: 2000,      safe: false },
  { level: 6,  coins: 5000,      safe: true  },
  { level: 7,  coins: 10000,     safe: false },
  { level: 8,  coins: 25000,     safe: false },
  { level: 9,  coins: 50000,     safe: true  },
  { level: 10, coins: 1000000,   safe: false },
];

const HARDCODED_QUESTIONS = [
  { question: "How many sides does a triangle have?", options: ["2", "3", "4", "5"], answer: "3", subject: "Math" },
  { question: "What is 5 + 7?", options: ["10", "11", "12", "13"], answer: "12", subject: "Math" },
  { question: "Which planet do we live on?", options: ["Mars", "Venus", "Earth", "Jupiter"], answer: "Earth", subject: "Science" },
  { question: "What do plants need to make food?", options: ["Moon", "Sunlight", "Sand", "Snow"], answer: "Sunlight", subject: "Science" },
  { question: "Who was the first President of the United States?", options: ["Abraham Lincoln", "George Washington", "Thomas Jefferson", "John Adams"], answer: "George Washington", subject: "History" },
  { question: "What holiday do we celebrate on July 4th?", options: ["Thanksgiving", "Halloween", "Independence Day", "Christmas"], answer: "Independence Day", subject: "History" },
  { question: "What do police officers do?", options: ["Cook food", "Build houses", "Keep people safe", "Fly planes"], answer: "Keep people safe", subject: "Civics" },
  { question: "Which of these is a vowel?", options: ["B", "C", "E", "T"], answer: "E", subject: "Reading" },
  { question: "What season comes after Summer?", options: ["Spring", "Winter", "Fall", "Monsoon"], answer: "Fall", subject: "Science" },
  { question: "What is 10 - 4?", options: ["4", "5", "6", "7"], answer: "6", subject: "Math" },
  { question: "Where do fish live?", options: ["In trees", "Underground", "In water", "On mountains"], answer: "In water", subject: "Science" },
  { question: "How many days are in a week?", options: ["5", "6", "7", "8"], answer: "7", subject: "Math" },
  { question: "What does a caterpillar turn into?", options: ["A bee", "A butterfly", "A spider", "A worm"], answer: "A butterfly", subject: "Science" },
  { question: "What letter comes after D in the alphabet?", options: ["C", "E", "F", "B"], answer: "E", subject: "Reading" },
  { question: "Who helps us when we are sick?", options: ["A firefighter", "A teacher", "A doctor", "A chef"], answer: "A doctor", subject: "Civics" },
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

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getQuestions() {
  return shuffle(HARDCODED_QUESTIONS).slice(0, 10);
}

// ---- Components ----

function CoinBurst({ show }) {
  if (!show) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 999 }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{
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

function AskParentModal({ onClose, onResume }) {
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

function GameOver({ won, coins, onRestart }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      fontFamily: "'Fredoka One', cursive", flexDirection: "column", textAlign: "center", padding: "2rem"
    }}>
      <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>{won ? "🏆" : "😢"}</div>
      <h1 style={{ fontSize: "2.5rem", color: won ? "#FFD43B" : "#FF6B6B", marginBottom: "0.5rem" }}>
        {won ? "YOU DID IT, MADHAV!" : "Oops! Better luck next time!"}
      </h1>
      <p style={{ color: "#ccc", fontSize: "1.2rem", marginBottom: "1.5rem" }}>
        {won ? "You won " : "You earned "}
        <span style={{ color: "#FFD43B", fontSize: "1.6rem" }}>🪙 {coins} coins!</span>
      </p>
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

  const startGame = () => {
    const initial = getQuestions();
    setQuestions(initial);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setAnswerState(null);
    setEliminatedOptions([]);
    setLifelinesUsed({ fifty: false, parent: false });
    setCoins(0);
    setWon(false);
    setScreen("game");

    // Background-fetch 3 AI questions and swap into positions 3, 4, 5
    Promise.all(
      ["Math", "Science", "History"].map(subject => fetchAIQuestion(subject))
    ).then(results => {
      setQuestions(prev => {
        const updated = [...prev];
        for (let i = 0; i < results.length; i++) {
          if (results[i]) updated[3 + i] = results[i];
        }
        return updated;
      });
    }).catch(() => {});
  };

  const q = questions[currentQ];
  const ladder = COIN_LADDER[currentQ];

  const handleAnswer = (option) => {
    if (selectedAnswer || answerState) return;
    setSelectedAnswer(option);
    setTimeout(() => {
      if (option === q.answer) {
        setAnswerState("correct");
        const earned = COIN_LADDER[currentQ].coins;
        setCoins(earned);
        setShowBurst(true);
        setTimeout(() => setShowBurst(false), 2000);
        setTimeout(() => {
          if (currentQ + 1 >= questions.length) {
            setWon(true);
            setScreen("gameover");
          } else {
            setCurrentQ(c => c + 1);
            setSelectedAnswer(null);
            setAnswerState(null);
            setEliminatedOptions([]);
          }
        }, 1800);
      } else {
        setAnswerState("wrong");
        setTimeout(() => {
          // Find last safe level
          const safeCoins = [...COIN_LADDER].slice(0, currentQ).reverse().find(l => l.safe)?.coins || 0;
          setCoins(safeCoins);
          setWon(false);
          setScreen("gameover");
        }, 2000);
      }
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

  const fetchAIQuestion = async (subject) => {
    try {
      const response = await fetch("/api/ask-claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject }),
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  };

  if (screen === "gameover") {
    return <GameOver won={won} coins={coins} onRestart={() => setScreen("intro")} />;
  }

  if (screen === "intro") {
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
        `}</style>
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
        <p style={{ color: "#9b8ec4", fontFamily: "'Nunito', sans-serif", fontSize: "1rem", maxWidth: 300, marginBottom: "2rem" }}>
          10 questions. 2 lifelines. Can you win 5,000 🪙?
        </p>
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

  const getOptionStyle = (option) => {
    const isEliminated = eliminatedOptions.includes(option);
    const isSelected = selectedAnswer === option;
    const isCorrect = answerState === "correct" && isSelected;
    const isWrong = answerState === "wrong" && isSelected;
    const showCorrect = answerState === "wrong" && option === q.answer;

    let bg = "rgba(255,255,255,0.05)";
    let border = "2px solid rgba(255,255,255,0.15)";
    let color = "white";
    let opacity = isEliminated ? 0.2 : 1;

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
  };

  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      fontFamily: "'Fredoka One', cursive", color: "white",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "1.5rem 1rem"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes coinFall { 0%{opacity:1;transform:translateY(0) rotate(0deg)} 100%{opacity:0;transform:translateY(200px) rotate(360deg)} }
        @keyframes ring { 0%{transform:rotate(-15deg)} 100%{transform:rotate(15deg)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes correctPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.02)} }
      `}</style>

      <CoinBurst show={showBurst} />
      {showParentModal && <AskParentModal onClose={() => setShowParentModal(false)} onResume={() => setShowParentModal(false)} />}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: 600, marginBottom: "1rem" }}>
        <div style={{ fontSize: "1.1rem", color: "#FFD43B" }}>🪙 {coins}</div>
        <div style={{ color: "#9b8ec4", fontSize: "0.9rem", fontFamily: "'Nunito', sans-serif" }}>
          Question {currentQ + 1} of {questions.length}
        </div>
        <div style={{
          background: `rgba(${subjectColor === "#FFD43B" ? "255,212,75" : "255,255,255"},0.1)`,
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
          <div key={i} style={{
            flex: "1 0 auto", minWidth: 44, height: 36,
            borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.7rem", fontFamily: "'Nunito', sans-serif",
            background: i === currentQ ? "#FFD43B" : i < currentQ ? "rgba(81,207,102,0.3)" : "rgba(255,255,255,0.05)",
            border: l.safe ? "2px solid #51CF66" : "1px solid rgba(255,255,255,0.1)",
            color: i === currentQ ? "#1a1a2e" : i < currentQ ? "#51CF66" : "#888",
            fontWeight: i === currentQ ? "bold" : "normal",
            transition: "all 0.3s"
          }}>
            {l.safe ? "🛡️" : `${l.coins}`}
          </div>
        ))}
      </div>

      {/* Question */}
      <div style={{
        background: "rgba(255,255,255,0.05)", border: `2px solid ${subjectColor}`,
        borderRadius: 20, padding: "1.5rem", width: "100%", maxWidth: 600,
        marginBottom: "1.25rem", animation: "slideIn 0.4s ease-out",
        boxShadow: `0 0 30px rgba(${subjectColor === "#FFD43B" ? "255,212,75" : "255,255,255"},0.1)`
      }}>
        <p style={{ fontSize: "clamp(1.05rem, 3vw, 1.25rem)", margin: 0, lineHeight: 1.5, textAlign: "center" }}>
          {q.question}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", width: "100%", maxWidth: 600, marginBottom: "1.5rem" }}>
        {q.options.map((option, i) => (
          <button key={option} onClick={() => handleAnswer(option)} style={getOptionStyle(option)}>
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
    </div>
  );
}
