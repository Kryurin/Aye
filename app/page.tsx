"use client";
import { useState, useRef } from "react";

const questions = [
  "Will you be with me forever? 🥹",
  "Are you sure? 😬",
  "Pleaaaseee? 🌷",
  "Really really sure? 😢",
  "What if I gave you food? 🍪",
  "Ayaw mo tlga??... 💔",
  "Sureeee? 😭",
  "You're breaking my heart :(( 💔",
  "I didn't wanna do this but you left me no choice 😿",
  "You're saying yes hmp 🫠",
];

const notes = [
  "Your heart knows the answer 💕",
  "Mas cute ang yes 🥹",
  "It's growing because it likes you hihi",
  "One tap and we'll be together forever 🥰",
  "Shawarma? Ice cream? I'll get you anything! :((",
  "Pleaseeeeeeeee 🥺",
  "Ayyaw mo tlgaaa?? :((",
  "Please 🥺",
  "...",
  "ugh",
];

const hearts = ["💖","💗","💕","🌸","✨","🎀","💝","🌷","💞","⭐"];

// After this many clicks the No button disappears and a label replaces it
const NO_LIMIT = 9;

export default function Home() {
  const [noCount, setNoCount] = useState(0);
  const [accepted, setAccepted] = useState(false);

  // noPos is only used AFTER the first click when the button goes position:fixed
  const [noPos, setNoPos] = useState<{ x: number; y: number } | null>(null);

  const noBtnRef = useRef<HTMLButtonElement>(null);

  // ─── helpers ────────────────────────────────────────────────────────────────

  const spawnParticles = (x: number, y: number, emojis: string[], count: number) => {
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 120;
      el.style.cssText = `
        position:fixed;pointer-events:none;z-index:9999;
        font-size:${1 + Math.random() * 0.8}rem;
        left:${x}px;top:${y}px;
        --tx:${Math.cos(angle) * dist}px;--ty:${Math.sin(angle) * dist}px;
        animation:burst ${0.6 + Math.random() * 0.5}s ease-out forwards;
      `;
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1200);
    }
  };

  const spawnRipple = (x: number, y: number, color: string) => {
    const el = document.createElement("div");
    el.style.cssText = `
      position:fixed;border-radius:50%;pointer-events:none;z-index:9998;
      left:${x}px;top:${y}px;background:${color};
      animation:rippleOut 0.7s ease-out forwards;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
  };

  // ─── handlers ───────────────────────────────────────────────────────────────

  const handleNo = (e: React.MouseEvent | React.TouchEvent) => {
    // Get coordinates — support both mouse and touch events for mobile
    let cx: number, cy: number;
    if ("touches" in e && e.touches.length > 0) {
      cx = e.touches[0].clientX;
      cy = e.touches[0].clientY;
    } else if ("clientX" in e) {
      cx = e.clientX;
      cy = e.clientY;
    } else {
      cx = window.innerWidth / 2;
      cy = window.innerHeight / 2;
    }

    spawnParticles(cx, cy, ["💨", "😬", "🏃", "😅"], 4);
    spawnRipple(cx, cy, "rgba(255,180,200,0.35)");

    const next = noCount + 1;
    setNoCount(next);

    // Read button size before it moves so random placement keeps it fully on screen
    const bw = noBtnRef.current?.offsetWidth  ?? 120;
    const bh = noBtnRef.current?.offsetHeight ?? 48;
    const mg = 20; // px gap from screen edges

    // Throw it to a random spot — it becomes position:fixed from this point on
    setNoPos({
      x: mg + Math.random() * (window.innerWidth  - bw - mg * 2),
      y: mg + Math.random() * (window.innerHeight - bh - mg * 2),
    });
  };

  const handleYes = (e: React.MouseEvent) => {
    const cx = e.clientX || window.innerWidth / 2;
    const cy = e.clientY || window.innerHeight / 2;

    spawnParticles(cx, cy, hearts, 28);
    spawnRipple(cx, cy, "rgba(255,107,138,0.4)");
    setTimeout(() => spawnParticles(cx - 60, cy - 40, hearts, 16), 220);
    setTimeout(() => spawnParticles(cx + 60, cy - 20, hearts, 16), 380);

    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const el = document.createElement("div");
        const sx = Math.random() * window.innerWidth;
        el.style.cssText = `
          position:fixed;pointer-events:none;z-index:9999;
          font-size:${1.2 + Math.random() * 1.2}rem;
          left:${sx}px;top:-20px;
          --tx:${Math.random() * 60 - 30}px;--ty:${120 + Math.random() * 200}px;
          animation:burst ${1 + Math.random() * 0.8}s ease-out forwards;
        `;
        el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2000);
      }, i * 80);
    }

    setAccepted(true);
  };

  const reset = () => {
    setAccepted(false);
    setNoPos(null);   // back to in-flow position inside the card
    setNoCount(0);
  };

  // ─── derived values ──────────────────────────────────────────────────────────

  // Yes grows on every No, capped at 2.8×
  const yesScale = Math.min(1 + noCount * 0.28, 2.8);

  // No shrinks + fades on every click, floored at 0.4× / 0.3 opacity
  const noScale   = Math.max(1 - noCount * 0.08, 0.4);
  const noOpacity = Math.max(1 - noCount * 0.08, 0.3);

  // noMoved = the button has been clicked at least once → it's now position:fixed
  // Before the first click (noPos === null) it lives inside the card in normal flow
  const noMoved      = noPos !== null;
  const showNoButton = !accepted && noCount < NO_LIMIT;
  const showNoLabel  = !accepted && noCount >= NO_LIMIT;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow: hidden; }
        body {
          min-height: 100vh; min-height: 100dvh;
          background: #fef0f3;
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Sans', sans-serif;
        }
        .wrap {
          min-height: 100vh; min-height: 100dvh; width: 100%;
          background: #fef0f3;
          display: flex; align-items: center; justify-content: center;
          padding: 2rem 1.25rem;
          position: relative; overflow: hidden;
        }
        .blob { position: absolute; border-radius: 50%; pointer-events: none; z-index: 0; }
        .b1 { width: 420px; height: 420px; background: #ffc8d4; opacity:.6;  top:-130px;    left:-100px;  filter:blur(70px); }
        .b2 { width: 360px; height: 360px; background: #ffb3c6; opacity:.45; bottom:-100px; right:-80px;  filter:blur(70px); }
        .b3 { width: 220px; height: 220px; background: #ffe8b0; opacity:.5;  top:50%; left:55%; transform:translate(-50%,-50%); filter:blur(55px); }
        .card {
          position: relative; z-index: 1;
          background: rgba(255,255,255,0.9);
          border: 1.5px solid rgba(240,160,180,0.4);
          border-radius: 28px;
          padding: clamp(1.5rem,5vw,2.5rem) clamp(1.25rem,5vw,2rem);
          width: 100%; max-width: 380px; text-align: center;
        }
        .ring {
          width: 72px; height: 72px; margin: 0 auto 1.1rem;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffb5c8, #e75480);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.9rem;
          box-shadow: 0 0 0 9px rgba(255,150,180,.15), 0 0 0 18px rgba(255,150,180,.07);
          animation: hb 2s ease-in-out infinite;
        }
        @keyframes hb {
          0%,100% { transform: scale(1); }
          30%     { transform: scale(1.09); }
          60%     { transform: scale(1.04); }
        }
        .question {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1rem,4.5vw,1.35rem);
          color: #7a3050; line-height: 1.6;
          margin-bottom: 1.5rem; min-height: 3.2rem;
        }
        .yes-wrap {
          width: 100%; display: flex;
          justify-content: center; align-items: center;
          transition: padding 0.35s ease;
        }
        .btn-yes {
          width: 100%; padding: 1rem;
          background: #e75480; color: #fff; border: none;
          border-radius: 16px; font-family: 'DM Sans', sans-serif;
          font-size: 1.05rem; font-weight: 700; cursor: pointer;
          box-shadow: 0 6px 20px rgba(231,84,128,0.5);
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation; user-select: none;
          transform-origin: center center;
        }
        .btn-yes:active { filter: brightness(0.93); }

        /* In-flow No button (before first click) — sits inside the card */
        .btn-no-inline {
          display: inline-block;
          margin-top: 0.9rem;
          padding: 0.8rem 1.5rem;
          background: #ffd6e0; color: #a0304f;
          border: 2px solid #f4a0b5; border-radius: 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem; font-weight: 600; cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation; user-select: none;
        }
        .btn-no-inline:active { background: #ffc2d0; }

        /* Roaming No button (after first click) — escapes the card */
        .btn-no-fixed {
          position: fixed; z-index: 999;
          padding: 0.8rem 1.5rem;
          background: #ffd6e0; color: #a0304f;
          border: 2px solid #f4a0b5; border-radius: 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem; font-weight: 600; cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation; user-select: none;
          transition: left 0.2s cubic-bezier(0.22,1,0.36,1),
                      top  0.2s cubic-bezier(0.22,1,0.36,1),
                      transform 0.35s ease, opacity 0.35s ease;
        }
        .btn-no-fixed:active { background: #ffc2d0; }

        .note {
          font-size: 0.8rem; color: #c47080;
          margin-top: 1rem; font-style: italic; min-height: 1.1rem;
        }
        .confetti { font-size: 2.3rem; letter-spacing: 6px; margin-bottom: 1.25rem; }
        .btn-reset {
          display: inline-block; padding: 0.75rem 1.75rem;
          background: #ffd6e0; color: #a0304f;
          border: 2px solid #f4a0b5; border-radius: 50px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; font-weight: 600; cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation; user-select: none;
        }
        .btn-reset:active { background: #ffc2d0; }
        .no-limit-label {
          position: fixed; z-index: 999;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem; font-weight: 600;
          color: #c47080; font-style: italic;
          pointer-events: none; text-align: center;
          left: 50%; bottom: 2rem;
          transform: translateX(-50%);
          white-space: nowrap;
        }
        @keyframes burst {
          0%   { opacity:1; transform:translate(0,0) scale(1); }
          100% { opacity:0; transform:translate(var(--tx),var(--ty)) scale(0.3); }
        }
        @keyframes rippleOut {
          0%   { width:0; height:0; opacity:0.6; margin:0; }
          100% { width:300px; height:300px; margin:-150px; opacity:0; }
        }
      `}</style>

      <div className="wrap">
        <div className="blob b1" /><div className="blob b2" /><div className="blob b3" />
        <div className="card">
          <div className="ring">{accepted ? "💖" : "🌹"}</div>

          <p className="question">
            {accepted
              ? "Yay!! I knew it all along! 🎉"
              : questions[Math.min(noCount, questions.length - 1)]}
          </p>

          {accepted ? (
            <div style={{ textAlign: "center" }}>
              <div className="confetti">🎊 🌸 🎊</div>
              <button className="btn-reset" onClick={reset}>↩ Start over</button>
            </div>
          ) : (
            <>
              {/* Yes button — grows with every No click */}
              <div
                className="yes-wrap"
                style={{
                  paddingTop:    `${noCount * 10}px`,
                  paddingBottom: `${noCount * 10}px`,
                }}
              >
                <button
                  className="btn-yes"
                  onClick={handleYes}
                  style={{ transform: `scale(${yesScale})` }}
                >
                  Yes 🥰
                </button>
              </div>

              {/*
                INLINE No button — only shown before the first click (noMoved false).
                Lives in normal document flow so it naturally sits between Yes and the note.
                No position:fixed, no coordinate math needed.
              */}
              {showNoButton && !noMoved && (
                <button
                  ref={noBtnRef}
                  className="btn-no-inline"
                  onClick={handleNo}
                >
                  No...
                </button>
              )}
            </>
          )}

          <p className="note">
            {accepted
              ? "Best decision you've ever made 🥰"
              : notes[Math.min(noCount, notes.length - 1)]}
          </p>
        </div>
      </div>

      {/*
        FIXED No button — only shown after the first click (noMoved true).
        Now position:fixed and jumps to a random spot on every click.
        Shrinks + fades as noCount increases.
      */}
      {showNoButton && noMoved && noPos && (
        <button
          ref={noBtnRef}
          className="btn-no-fixed"
          onClick={handleNo}
          style={{
            left:      `${noPos.x}px`,
            top:       `${noPos.y}px`,
            transform: `scale(${noScale})`,
            opacity:   noOpacity,
          }}
        >
          No...
        </button>
      )}

      {/* Replaces No button after NO_LIMIT clicks */}
      {showNoLabel && (
        <p className="no-limit-label">Just say yes already 😤</p>
      )}
    </>
  );
}