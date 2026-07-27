import React, { useState, useEffect, useRef } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;700&display=swap');
.gp-root {
  --void: #170826; --panel: #26103F; --magenta: #FF2D95; --cyan: #22E4E4;
  --gold: #FFC53D; --bone: #F5EDE4; --dead: #4A3560;
  background: var(--void);
  background-image: radial-gradient(ellipse at 50% -10%, rgba(255,45,149,0.22), transparent 60%), radial-gradient(ellipse at 50% 110%, rgba(34,228,228,0.14), transparent 60%);
  color: var(--bone); font-family: 'JetBrains Mono', ui-monospace, monospace;
  min-height: 100vh; padding: 18px 12px 44px; overflow-x: hidden;
}
.gp-wrap { max-width: 1280px; margin: 0 auto; }
.gp-title { font-family: 'Anton', Impact, sans-serif; font-size: clamp(32px, 9vw, 74px); line-height: 0.88; letter-spacing: -0.02em; text-transform: uppercase; margin: 0; text-shadow: 3px 3px 0 var(--magenta), 6px 6px 0 rgba(34,228,228,0.5); }
.gp-eyebrow { font-size: 11px; letter-spacing: 0.34em; text-transform: uppercase; color: var(--cyan); margin: 0 0 10px; }
.gp-sub { font-size: 13px; line-height: 1.6; color: rgba(245,237,228,0.68); margin: 12px 0 20px; max-width: 58ch; }
.gp-btn { font-family: 'Anton', Impact, sans-serif; font-size: 21px; letter-spacing: 0.05em; text-transform: uppercase; background: var(--magenta); color: #fff; border: none; padding: 14px 32px; cursor: pointer; box-shadow: 5px 5px 0 var(--cyan); transition: transform 0.08s, box-shadow 0.08s; }
.gp-btn:hover:not(:disabled) { transform: translate(2px,2px); box-shadow: 3px 3px 0 var(--cyan); }
.gp-btn:disabled { background: var(--dead); box-shadow: 5px 5px 0 rgba(255,255,255,0.08); cursor: not-allowed; }
.gp-ghost { font-family: inherit; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; background: transparent; color: rgba(245,237,228,0.72); border: 2px solid rgba(255,255,255,0.18); padding: 12px 18px; cursor: pointer; }
.gp-ghost:hover { color: var(--bone); border-color: var(--cyan); }
.gp-btn:focus-visible, .gp-ghost:focus-visible, .gp-mute:focus-visible { outline: 3px solid var(--gold); outline-offset: 3px; }
.gp-entrants { display: flex; flex-wrap: wrap; gap: 10px; margin: 14px 0 20px; }
.gp-entrant { text-align: center; width: 74px; }
.gp-face { width: 58px; height: 58px; border-radius: 50%; overflow: hidden; border: 3px solid var(--cyan); margin: 0 auto; background: #E8B98A; flex-shrink: 0; }
.gp-face img { width: 100%; height: 100%; object-fit: cover; }
.gp-entrant span { display: block; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 4px; color: rgba(245,237,228,0.8); }
.gp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 10px; margin-top: 16px; }
.gp-gridcard { background: var(--panel); border: 2px solid rgba(255,255,255,0.1); padding: 12px; display: flex; gap: 10px; align-items: center; opacity: 0; animation: gp-cardin 0.45s cubic-bezier(.2,1.2,.4,1) forwards; }
.gp-gridcard .gp-face { width: 52px; height: 52px; margin: 0; }
.gp-gc-name { font-family: 'Anton', Impact, sans-serif; font-size: 18px; text-transform: uppercase; line-height: 1; }
.gp-stat { display: flex; align-items: center; gap: 4px; margin-top: 4px; }
.gp-stat span { font-size: 8px; letter-spacing: 0.14em; color: rgba(245,237,228,0.5); width: 28px; }
.gp-dot { width: 7px; height: 7px; background: rgba(255,255,255,0.12); }
.gp-dot.on { background: var(--cyan); }
.gp-track { position: relative; border: 3px solid rgba(255,255,255,0.14); overflow: hidden; background: linear-gradient(to bottom, #1B0A2E, #24103C); }
.gp-track.moving::before { content: ""; position: absolute; inset: 0; background: repeating-linear-gradient(to right, rgba(255,255,255,0.05) 0 26px, transparent 26px 96px); animation: gp-scroll 0.5s linear infinite; }
.gp-track.slowmo.moving::before { animation-duration: 1.6s; }
.gp-track.slowmo { transform: scale(1.015); }
.gp-track.finalfx { animation: gp-finalpulse 1s ease-in-out infinite alternate; }
.gp-track.zap::after { content: ""; position: absolute; inset: 0; background: rgba(190,245,255,0.5); animation: gp-zapflash 0.5s steps(4) forwards; z-index: 8; pointer-events: none; }
.gp-lane { position: relative; height: 62px; border-bottom: 1px dashed rgba(255,255,255,0.08); }
.gp-lane:last-child { border-bottom: none; }
.gp-lapline { position: absolute; top: 0; bottom: 0; width: 2px; background: rgba(34,228,228,0.22); z-index: 1; }
.gp-lapline span { position: absolute; top: 2px; left: 5px; font-size: 8px; letter-spacing: 0.2em; color: rgba(34,228,228,0.55); white-space: nowrap; }
.gp-finish { position: absolute; top: 0; bottom: 0; right: 8px; width: 14px; background: repeating-conic-gradient(#fff 0% 25%, #000 0% 50%) 0 0 / 14px 14px; opacity: 0.85; z-index: 2; }
.gp-kart { position: absolute; top: 4px; width: 88px; height: 46px; transition: left 0.14s linear; z-index: 3; }
.gp-track.slowmo .gp-kart { transition: left 0.4s linear; }
.k-anim { position: absolute; inset: 0; animation: gp-trot 0.34s ease-in-out infinite; }
.wheel { animation: gp-wheelspin 0.34s linear infinite; transform-box: fill-box; transform-origin: center; }
.tail { animation: gp-tailwag 0.5s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: 90% 60%; }
.gp-kart.halted .k-anim, .gp-kart.halted .wheel, .gp-kart.halted .tail { animation-play-state: paused; }
.gp-kart.boosting .wheel { animation-duration: 0.12s; }
.gp-kart.boosting .k-anim { animation-duration: 0.2s; }
.gp-track.slowmo .wheel { animation-duration: 1.1s; }
.gp-track.slowmo .k-anim { animation-duration: 1s; }
.gp-kart.leader { filter: drop-shadow(0 0 8px rgba(255,197,61,0.9)); }
.gp-kart.armed .k-anim { filter: drop-shadow(0 0 9px rgba(255,197,61,0.95)); }
.gp-kart.spin { animation: gp-spin 0.8s linear infinite; }
.gp-kart.flat { transform: rotate(7deg); }
.gp-kart.launch .k-anim { animation: gp-launch 0.6s ease; }
.gp-kart.warp .k-anim { animation: gp-warp 0.65s ease; }
.gp-kart.sinkfx .k-anim { animation: gp-sink 0.7s ease forwards; }
.gp-kart.shakefx { animation: gp-shake 0.4s ease; }
.gp-kart.finished .k-anim { animation: gp-finishhop 0.9s ease; }
.gp-kart .k-face { position: absolute; left: 52px; top: 0; width: 30px; height: 30px; border-radius: 50%; overflow: hidden; border: 2px solid #000; z-index: 2; background: #E8B98A; }
.gp-kart .k-face img { width: 100%; height: 100%; object-fit: cover; }
.gp-kart .k-name { position: absolute; left: 6px; top: 47px; font-size: 9px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; background: rgba(0,0,0,0.6); padding: 0 4px; white-space: nowrap; }
.gp-kart.boosting::after { content: ""; position: absolute; left: -17px; top: 22px; width: 17px; height: 8px; background: linear-gradient(to left, var(--gold), var(--magenta), transparent); border-radius: 4px; animation: gp-flame 0.12s alternate infinite; }
.gp-crown { position: absolute; left: 58px; top: -16px; font-size: 14px; z-index: 5; animation: gp-crownbob 0.8s ease-in-out infinite alternate; }
.gp-emote { position: absolute; left: 24px; top: -16px; font-size: 17px; z-index: 4; animation: gp-emote 0.5s ease infinite alternate; }
.gp-smoke { position: absolute; left: -4px; top: 26px; font-size: 13px; z-index: 4; animation: gp-smokeup 0.9s ease-in-out infinite; }
.gp-place-tag { position: absolute; right: -8px; top: 8px; font-family: 'Anton', Impact, sans-serif; font-size: 15px; color: var(--gold); text-shadow: 1px 1px 0 #000; z-index: 4; }
.gp-box { position: absolute; width: 17px; height: 17px; z-index: 2; background: var(--gold); border: 2px solid #000; color: #000; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; animation: gp-emote 0.6s ease infinite alternate; box-shadow: 0 0 8px rgba(255,197,61,0.6); }
.gp-jeans-road { position: absolute; z-index: 2; height: 44px; filter: drop-shadow(0 0 9px rgba(255,197,61,0.9)); animation: gp-emote 0.6s ease infinite alternate; }
.gp-proj { position: absolute; z-index: 7; font-size: 20px; transition: left 0.45s cubic-bezier(.2,.6,.4,1), top 0.45s cubic-bezier(.2,.6,.4,1); }
.gp-reticle { position: absolute; width: 38px; height: 38px; border: 2.5px dashed; border-radius: 50%; z-index: 6; animation: gp-reticlespin 0.55s linear infinite; }
.gp-burst { position: absolute; z-index: 7; font-size: 26px; animation: gp-pop 0.6s ease forwards; }
.gp-roulette { position: absolute; left: 52px; top: -30px; width: 24px; height: 24px; overflow: hidden; background: rgba(0,0,0,0.6); border: 2px solid var(--gold); z-index: 6; box-shadow: 0 0 10px rgba(255,197,61,0.7); }
.gp-roulette .strip { animation: gp-slot 0.48s steps(8) infinite; }
.gp-roulette .strip span { display: block; width: 24px; height: 24px; font-size: 17px; line-height: 24px; text-align: center; }
.gp-standings { display: flex; gap: 6px; flex-wrap: nowrap; overflow-x: auto; margin-top: 12px; align-items: center; padding-bottom: 4px; }
.gp-chip { flex-shrink: 0; display: flex; align-items: center; gap: 5px; background: var(--panel); border: 1px solid rgba(255,255,255,0.12); padding: 3px 7px 3px 3px; }
.gp-chip .gp-face { width: 24px; height: 24px; border-width: 2px; margin: 0; }
.gp-chip b { font-size: 11px; color: var(--cyan); }
.gp-chip span { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
.gp-chip.p1 { border-color: var(--gold); }
.gp-chip.p1 b { color: var(--gold); }
.gp-feed { margin-top: 12px; max-height: 150px; overflow-y: auto; border-top: 2px solid rgba(255,255,255,0.12); padding-top: 8px; }
.gp-line { font-size: 13px; line-height: 1.55; padding: 4px 0; border-bottom: 1px dashed rgba(255,255,255,0.08); animation: gp-in 0.3s ease; }
.gp-line .tick { color: var(--cyan); }
.gp-line.big { color: var(--gold); }
.gp-flash { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 40; }
.gp-flash b { font-family: 'Anton', Impact, sans-serif; font-size: clamp(30px, 8vw, 74px); text-transform: uppercase; text-align: center; color: var(--bone); text-shadow: 4px 4px 0 var(--magenta), 8px 8px 0 var(--cyan); animation: gp-slam 0.9s ease forwards; padding: 0 16px; }
.gp-hud { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
.gp-hud-stat { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(245,237,228,0.55); }
.gp-hud-stat b { color: var(--cyan); }
.gp-hud-stat b.final { color: var(--magenta); }
.gp-mute { background: none; border: 2px solid rgba(255,255,255,0.18); color: var(--bone); font-size: 14px; padding: 4px 10px; cursor: pointer; }
.gp-champ, .gp-jcard { position: fixed; inset: 0; z-index: 60; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; text-align: center; padding: 20px; animation: gp-in 0.25s ease; overflow: hidden; }
.gp-champ { background: radial-gradient(ellipse at 50% 40%, rgba(255,197,61,0.3), rgba(13,4,24,0.95) 70%); }
.gp-jcard { background: radial-gradient(ellipse at 50% 40%, rgba(255,45,149,0.32), rgba(13,4,24,0.95) 70%); }
.gp-champ .gp-face { width: 136px; height: 136px; border-width: 5px; border-color: var(--gold); animation: gp-bigslam 0.55s cubic-bezier(.2,1.4,.4,1); }
.gp-jcard img { height: min(240px, 34vh); border: 4px solid var(--gold); animation: gp-bigslam 0.55s cubic-bezier(.2,1.4,.4,1); box-shadow: 0 0 40px rgba(255,197,61,0.6); }
.gp-big-title { font-family: 'Anton', Impact, sans-serif; font-size: clamp(34px, 10vw, 84px); line-height: 0.95; text-transform: uppercase; color: var(--bone); text-shadow: 4px 4px 0 var(--magenta), 8px 8px 0 rgba(34,228,228,0.5); animation: gp-bigslam 0.6s cubic-bezier(.2,1.4,.4,1); }
.gp-champ .gp-big-title { text-shadow: 4px 4px 0 var(--gold), 8px 8px 0 rgba(255,45,149,0.5); }
.gp-big-sub { font-size: 13px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--cyan); }
.gp-confetti { position: absolute; top: -14px; width: 9px; height: 14px; animation: gp-fall linear infinite; }
.gp-podium { list-style: none; padding: 0; margin: 18px 0 0; }
.gp-podium li { display: flex; align-items: center; gap: 14px; border-bottom: 1px solid rgba(255,255,255,0.1); padding: 10px 4px; }
.gp-pick { font-family: 'Anton', Impact, sans-serif; font-size: 28px; color: var(--dead); min-width: 50px; }
.gp-podium li:first-child .gp-pick, .gp-podium li:first-child .gp-who { color: var(--gold); }
.gp-who { font-family: 'Anton', Impact, sans-serif; font-size: 22px; text-transform: uppercase; }
.gp-podium .gp-face { width: 42px; height: 42px; margin: 0; }
.gp-tag { margin-left: auto; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(245,237,228,0.4); }
.gp-foot { font-size: 11px; line-height: 1.7; color: rgba(245,237,228,0.4); margin-top: 22px; }
@keyframes gp-scroll { from { background-position-x: 0; } to { background-position-x: -96px; } }
@keyframes gp-spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
@keyframes gp-flame { from { opacity: 0.6; transform: scaleX(0.7); } to { opacity: 1; transform: scaleX(1.25); } }
@keyframes gp-emote { from { transform: translateY(0); } to { transform: translateY(-5px); } }
@keyframes gp-in { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: none; } }
@keyframes gp-pop { 0% { transform: scale(0.4); opacity: 1; } 100% { transform: scale(2); opacity: 0; } }
@keyframes gp-slam { 0% { opacity: 0; transform: scale(2.4); } 15% { opacity: 1; transform: scale(1); } 78% { opacity: 1; } 100% { opacity: 0; transform: scale(1.1); } }
@keyframes gp-bigslam { 0% { transform: scale(2.6); opacity: 0; } 60% { transform: scale(0.95); opacity: 1; } 100% { transform: scale(1); } }
@keyframes gp-cardin { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: none; } }
@keyframes gp-fall { from { transform: translateY(-20px) rotate(0); } to { transform: translateY(110vh) rotate(720deg); } }
@keyframes gp-trot { 0%, 100% { transform: translateY(0) rotate(0.4deg); } 50% { transform: translateY(-2px) rotate(-0.6deg); } }
@keyframes gp-wheelspin { to { transform: rotate(360deg); } }
@keyframes gp-tailwag { from { transform: rotate(7deg); } to { transform: rotate(-9deg); } }
@keyframes gp-launch { 0% { transform: translateX(0) rotate(0); } 30% { transform: translateX(-4px) rotate(-7deg); } 100% { transform: none; } }
@keyframes gp-warp { 0% { transform: scale(1) rotate(0); } 50% { transform: scale(0.15) rotate(180deg); opacity: 0.4; } 100% { transform: scale(1) rotate(360deg); } }
@keyframes gp-sink { to { transform: translateY(20px) rotate(140deg) scale(0.15); opacity: 0.1; } }
@keyframes gp-shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px) rotate(-3deg); } 60% { transform: translateX(5px) rotate(2deg); } }
@keyframes gp-finishhop { 0% { transform: translateY(0); } 30% { transform: translateY(-9px) rotate(-4deg); } 55% { transform: translateY(0); } 75% { transform: translateY(-4px); } 100% { transform: translateY(0); } }
@keyframes gp-smokeup { 0% { transform: translate(0, 0); opacity: 0.9; } 100% { transform: translate(-11px, -11px); opacity: 0; } }
@keyframes gp-slot { from { transform: translateY(0); } to { transform: translateY(-192px); } }
@keyframes gp-reticlespin { from { transform: rotate(0) scale(1); } to { transform: rotate(180deg) scale(1.1); } }
@keyframes gp-crownbob { from { transform: translateY(0) rotate(-4deg); } to { transform: translateY(-3px) rotate(4deg); } }
@keyframes gp-zapflash { 0% { opacity: 1; } 25% { opacity: 0; } 50% { opacity: 0.9; } 100% { opacity: 0; } }
@keyframes gp-finalpulse { from { box-shadow: 0 0 0 3px rgba(255,45,149,0.4), 0 0 18px rgba(255,45,149,0.25); } to { box-shadow: 0 0 0 3px rgba(255,45,149,0.75), 0 0 46px rgba(255,45,149,0.5); } }
@media (prefers-reduced-motion: reduce) { .gp-root * { animation: none !important; transition: none !important; } }
`;

const FACES = {
  "Pit": "data:image/jpeg;base64,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",
  "Moe": "data:image/jpeg;base64,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",
  "Muss": "data:image/jpeg;base64,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",
  "Ronny": "data:image/jpeg;base64,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",
  "Chuck": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgFBgcGBQgHBgcJCAgJDBMMDAsLDBgREg4THBgdHRsYGxofIywlHyEqIRobJjQnKi4vMTIxHiU2OjYwOiwwMTD/2wBDAQgJCQwKDBcMDBcwIBsgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDD/wAARCAB0AHQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDhdOnjvvDksMSBZYgwIz1zyKxfuxo7DIIPGeRSeH7pobsJH0lIU5qXUwEmYKhVVYgZGKVrOx0Ig8xp2UOQCBtpxjby0eNoyqHBAzke+KroC5bb0PJB74qZmiUqQxPTI9DSaJZvaPrFzBFLZLIzpckAsDhvzz7V1OlXclvbeV9naJ0GCS2WbnrXD6fex2MouxiTC5UMuBu/zmq11rN5eSMS7KG7IMVkqPMyOW56EfsotxJeSAO+ThuWGT1pkkNrcqSZAyMMAY/Q+ledkysu92ZwBnGOasQTXNsokR2IzkYNX9XfRi5DtDp8oZV3hYguVOCCtXdFkl0/XYLqNdpyAhY5HTBJrmtM8VSxTBbsb0b5S2M7R/Wursrq0vl2tPvaJEQEnG/n0+mBUOEokSTW53Wo+KnS2litIBFI3yl9w+RgMke//wBeuVOvXMqSu8q+bPbmJ5VGflOf1waju9LSKDKbZo5ScBAevQnNZkaRRQkhSscTBSAOuT2qJyZCRh69p/2WaNwwk81fmxnO/wD/AFY/KuduoyCWI7/lXca2Y57JxEAGiIcEjkjv+NcldRBlJx15FXCVztg7xMtX4opjFkYrgnFFbXEVIDMvzRkYJ5wRWzMjXFtuIztUEuOvbrWEjljmLhsHJJ610ETulqVHG5MH/P4U5AjKEY3Ehip7c1b0uDzLhzKqyIo+bI6+mPes+5+8MGu08D6Ebu1Ekn8Z3H3FDstRNGJLp087YVCFJxgU+TRpbZd0i7cdj3r23wv4Qs0lSe4iDCPlVPr710V/oGl364ubOJz67eay9vYeh8xeaLaUKyuFzyvatEiKSHcpGG49K9T8RfCyK5maXTZxECP9W4yK5i4+GOvQ2sjNHDMEOQImOW/CtlWix2PP3RonOMYHBz3rqvA2oabFqYttYylvcLsSZTkxMT1+nam/8Ibr02QNKmBGRyvWrlx8N9dtrM3Rsz5aDeVDZKim5watclxurM9Nksre2BhsgTbyqQ0uAR0zwPwrk5JIkZleVchvvJ1x24qbRNYmuvCkdpIzC4CPCWJwRjsfTjBH41iXdtIhKPKhIIJJODjPQVxzVzmiraFyeOB2Mjl1VhgsuCDn1rlriHy5nTkqDxnuO1b6l1bbFOcAEEAjaazrq3JIcgljw5zmphdM3puzMC5tQZSQKK1mhGfmHNFbXNbHDpbs+540O1BljngCugt45JY1WMZYqBg0zQ/sMAk+3+arMM7UYESLgcY9amuSIo1aF8blwQP4RnpW0mRHUyZrad5CqRM+0/NgZxXtXgrTRaWNrGQNyxLn8hXC/D7Szql/cxveC2QoF3EkbmOdq8fQ17BoVgsJ2tgtCoQ/UcVhVnpYpxa1NyyYJCAB1qwPm5ArE1TVDp6fuYvNlJwFzgCseXxLrsMTSjTllA/hRhmua1x8rZ24TPUU7y8dG/OvOLH4jyvc+Te6fLan1NdnZ60k9ssyjKEZzQ9GJwkjW2gDnBppw/ykZHcGsG78Z6TZSql1cqhY457VftNasL/H2W5jcnoAetMlpo8s+IGlppOvFrYFEnHmAA8bs4/wpmlW+kaJFFP4qLNPejEcZG4wp/fYf0rqviDeafp9xDe6innPCha3hIyJJM8Z9hXnEMM+sXk2oas7NJNnAxkqPYdK3jLTUI0nN3O11DRLJFTbGhhdQY5IvuuPUVSutDspVIBkDEcEHBHv0qPRtaOm/wCi3aNLpzn7h+9H/tL6H2rVv4BAEnhl8+2mH7uVen0Poae+wnFwep57JFJbyyQykB42KnPeiumvtMtLycyz7t5GDiigvmPKJLeZsMoYgD8a1XRfLAxyRk1oQ2aJGEAyAMZbkmq0gAQgADFathE6f4YRWu69nuz+7tWjl2jqxwwA/OvUvD1x9qtmuNrJ5rZCt1AwK8q+Fc8f/CRyWU6BoryIqVPqpz/jXqeiSoVnRSPkmYYz0GeBXLVWprKV4pBrOhT34LQ3Lwk9161xOr+F9ajZVTWbtMHkCLO78a9TgmUjHAxUzmAjLBc1C0JU2tDyjTPCeozXe6SR3gP/AD0616ba6dDHorW6oBiMjj1xQLiF5CEZVVO5q9DPCYyu4cijfcc5tnhGrxyWOoObzR3u4w+Pu7iR6102nz6VMiRWdq9jcYDAAFSD71395olpqDFmXbKD94cGpLbRLeBB5qiQjoWAzTvoU6iaOB+Ith9rk0m5nkDeXGylO5bjmsEbUBAPvXaeM2jTUgPKSRYYBhXGQNz4zXI6Uvm6gmyMO2GYJjIJ2k4xStoioTSi/IoyOMcnIqfSNYm0/wAy3ZTcWsow8JGQOOo9DUWpO5vJfOhELluVC7cfhUNlcSW0kk0DbXVRgkZ6sB0/GrhvYqpZwuxZjq0TKGJXcoYD5TwenaisHxXeTy6hFI0r7mt0Jw2OcelFdBy8pzyaje5GJyfqK1GLNHkg5I5Nc8JkDhc966JTuUKTxVT0L0GWOpXOkX8d9YsEniOVJGRXd+EfEU6zmaU5875nHbJ54rgxZzXc4t7dd8jttUV12oaDqHhWa1ttQQBngDbgcrnuAfyqJLQL9D0KPXonOI2w/dauLfDZvuXEcY9e9eYw3heeKUsMow6d66mBovEWo+TK7CCGMF9jYyfSuWUWikkXPE99bXNuqQxynbyrIxX+VYOl61eTTfZort7dVYKWkUkj8+tauuWtlYW4i/tO4tIx93c+QPxxVXTknv5VEWqW16i8YaPOfxHNGljeMPduehWzNaxRt5pmBUZc9z61Ye8Drx/OuOsLu8029+w3hUwyfMjZ4Ax05rM1rxkluHt7Eh5W+QN6E1KvfQ53C5bv7m0v9Vv/ALXeJbLhURmBP3SD0H0rk/Nltm3W8zxsOkiHaaSV26sck9frVdzk9Kq7sdEYWu+4k80szmSaRpZDyWdsk/ial02Wwilf+0xM8TLjbDgE4IPU/Sqrn61BJyaadnccopxsU/FyRHVVFsJBEsKBN3XGOM+9FXdVazE8fnEBjEnf2ora7MVE83RN8q47kV1sQaWQRqCxPAx2qWLwtYwOryzyuynOFwB+Zq6zQ2rbYEVAw65yfzrscOY5uYrviwAaIkyA5LD+leu6Zc23xG8Ei3lK/wBpWSgHnknHB/H+Yrxa5m3OR1rQ8IeI7nwxrUV9bfMv3ZY88Oh6irlTTWhLvuM1eC80O+ljuFZVDFQSOh9/etr4feKYbK5mivOVlI+bPIr07XNF0vxto8Wp6cyMZ0yG7H1Vh6jpXjGveELnS710j3QuD9x+n4GuRpP3ZG0J8yPajHoGs22248q4RhnBapNO0fw/p0bPYJFACckhv8a+f4J9f05j5UcwX1QEipV1LxHdkRotxhvYgVk6PZ6F69zv/iX4hgtdRtIbSZXIVt+01yek+ZcTfa5IyY8koD/EfWmSeGrtY7e71aUtJLnag5AA9/WtCJSo2bgAOgx/KolKMFyxJ9pZmhLazLawSlmVpTjBUjFVNRR7S5aHerEd8dae5uEwsjSKV5AbIIqGQl5Nznd9Tnio5kEazT1IovMmmWNdpLfhTxBLJPJEqqWTO7mlDrGwdE2sD1FCTFZmdJGDOfmJ70+ZWG6zb0OW8XGRtYIBICRqvFFaOr2LXN/JIFyM46elFWpo6UtC/IxOcms+4G6RTnGDVx3HSqlwiyKyMMqetesecUnUmQjrTJkwmf0qP7NdRNmGbcmfuyDOPxqSUs+MnP0pjO1+DvittI1c6XeSYsr04BY8Rydj+PSvXdX0aDVIGhu4gwPQ91+hr5mAKsGBII7ivon4X+JF8ReHY1nYG9tAIpfVh2b8RXNWh1Iejujjtb8KXGkvuBL27HCvjp7H3qbw7oL3lyiKu4nn6D1Nd/dalaXs81jCizqh2SngjPcfhVyzhjsF3WyIisQSAK4nDXyN1XfLbqedfF2zGmW2i20MixuRIAWHBPBNcTp6XMd7AzSxnEik/KfWt39ojVTNeaPHHkGNHdseu4D+lcrpM66hZI4k8uQcMcZzWrotxvEyV7anZ/E0yTeKS9rJHs8hAxPPPP8ATFcoY70t8skG33BrRn024uGR47hmBRRuEZPQY9fak/safvM/P/TI/wCNc7jIaWhQ23Q4MkH68UM8yPCr7GEj7Rt9atNot0uTuc56Yi/+vUVxaPZ3WmBtzHzXb5lx/doUG9yo6MurbiQbwPvEn9aKvWcYNup655orn0O65yIOeTTGPNFFfQHnFLcRePHnKlN+D2NOCgpRRQgK7KK6b4ZaldWHim2S2kKpdHyZB2KmiilU+Eb2Z6faQrYa5cLbFkWfLsueAcdRXYQ82+Cc/LnNFFeeyJbHlHxStIb7QlvZ0HnQXMkSkcfL7/lXmPhiV476SFT+7OePpRRXXT2NOh2Gl3k0UyqjfKx5B6V1J+ZV5I3DJxRRXDjNHoZMilJWUgE4qpqMzm1jU4Id15xyOR0oorkpt3HD4kWLeJFgQAcYoooqUeif/9k=",
  "Saleh": "data:image/jpeg;base64,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",
  "Aoc": "data:image/jpeg;base64,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",
  "Joe": "data:image/jpeg;base64,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",
  "Jamal": "data:image/jpeg;base64,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",
  "Pubes": "data:image/jpeg;base64,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",
};
const JEANS = {"icon": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBUODAsLDBkSEw8VHhsgHx4bHR0hJTApISMtJB0dKjkqLTEzNjY2ICg7Pzo0PjA1NjP/2wBDAQkJCQwLDBgODhgzIh0iMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzP/wAARCABAACIDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDg47VSCNvOO3JpVikiUCN16cDGP5ilhBSaMnP3xjp61NFJlgfJUFTuLBmA4/H2/Ws6EE43Z14mbUkkNWS7CL+/iyQTjK+pHTHtXRapJoL2aLYx3H2hpF3ExEALjnn64rDgL7lUPvDoQRk8ncTzShtwfEKp+7/hGefxzWkqUX0MY1pJ7k5t4s/db8//AK1FTK1yyg7uoz9wUV5mp6+hSushEO4nNQvJI6gM7FSeTnP51ZuC0iRsYymOmQRmovLOMAfrXqYZfu0eVineqyZoFEFs8cexihycnDYY8/ypZWYr88jE5ycd66nXtFeDwzYTmExm2wj8cnd1P5j9a5KRCo5PB71VKSnG/qZ1Y8srFyO+VIkUxxkgAZIorLK8/eorN4WLZssVJI0LyZXeJQSQq0lsiPeQKejOoP51VkUBsA5461Pbkrcwnrhwf1q6KtTSM67vVbPc/EelxzeBNSKjOIvM/wC+SG/pXhjBMZxzXvsl4l14Q1GA/eazlXHqShr5+Zl3ZJFLD8vJZCrc3O7jcfSik3D2ore5kE7DzyuecDHGO1COUkQ7v4h1qO4CyXTLnHAwfwqIyFCATu9DWFN+4jeqvffqewR6mxsXhwcFSMjntXkckiKT83f1ruE1BCgJkA9z3/WuCKbnbAHykiufBy3RvjI2sxhmGfuGikKtk0V23OI//9k=", "card": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgFBgcGBQgHBgcJCAgJDBMMDAsLDBgREg4THBgdHRsYGxofIywlHyEqIRobJjQnKi4vMTIxHiU2OjYwOiwwMTD/2wBDAQgJCQwKDBcMDBcwIBsgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDD/wAARCADIAGsDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDzYQMAOq59qkEDf3z+WKmQBVw2DjuGxUkZHOCfzBrgue1ZFYwAYBdix4ALHrUVpCoVheMgk3EYyTWn+6IDOoO3kEcYqlHsIIdnVjkkMg6/nW9GPPe5zV5uFmiZTbIAoaMD/dP+FTpNagAmUf8AfLc/pVXyovvB5CB32Dr+dNYIEDL5uB3IH+NbfV4HP9amaK3togIeU7iecRn/AAqY31iI93mswyP+Wf19vauekKnBZHI/3gP6VamULawb4+JACuDg8Dvx70nhoFfWqhsHULRlASfn3TH9Ks2lsL9ZWtZfMWFd8uMAIPUk1zyhRHtJb3woP9a7v4Rxxi61JhMsfyICbhPlwd3bPNRPDwSuio4ubdjFOlh3CrOgzzkygD0qPUtONja28xMUi3JYRFWznbjP869bSESX8CQzQPGrFpG2gnHGMD8TyfTvXHfFlNz6MysLkKZCDAnHVeozxxWSpxeiL+sTW5w25DwYyT60oUY+6v5GtbFtsGIye4wKjDRY/wBSf1rm5jv5TJWNF+/jH50qRrnO4EduKrqGbp3/AB/lShTuGG/8dqyLludZigFtG00uchUTJwOScUxNQu3GJolY990ZzU2hzTQayptnCOImG4gd8dcj6U+VNbt0aadpMHklSuP0/wA8130I2ieZiJc0/Qrm7hJHm2VsT9MU1riyYYeyVfdWNOa9vhaJcswMbuybmGcsACf/AEKozfakpHlQFzkHiE1sc42S5sQAVsgSD3Jwa0dTu9NltbAyW0kZ8s/dbIHT1zTfEd890LS1ljhRoVyREpUHOOevsar6ltextFVTlYz/AEoQC/atK2kJbzFuu7f/APqp9pqn2Yt9htZBuxuZJHG70zg+9Xbq9MtlaSWOnQIzptdo49xLD+VVLqbVLePfMJ4Vx/cwo/Si1w2LI17VyP3MVwp/3nNUbi71+/kEYS4JUEhQp4Hc81YmGopOts0s7mSNZF2nhgwz/XFWdPTULGfzX1BIlK5ZFcbiOfTmk1Yetyvpskk9lGwRmcfKSPUVIWdTjy2P4VHpDwwvdwyuiDzCV3Ec8kHv7Crv+j/89IT+I/xryqq5ZtHtUZc1NM5vyUkwcJkdCMg06CLPB3nB9qeE3AA5/SlSIRKcM/HPIzVCJdHjjfUpDLygjfPOAOg5P/66Yt3PaMRA4VN3yqASDgcg557il0lgL2JQPmdShJPr/wDWqFlBV1zuMZw2OSMcZx3B716iVtDxpO7uaf8AbSeVtFqq7W8wK3Kh8ctj/PemW2o3l1eKguHiU4JKkLgbQWGO/wCdZ/BcHZ55xkKo4+pq3amGOxmny24fJn1Y9T+fH4U7Im7Irs+bdSTbi3zYDHqfenXoKrDGOqL6fSo5HVIRhcnHSrupOty6SR4GY1K4+madhEWmGc2N0kdw8IjO/CNjI7+w+tSRahewgRiTeoZkKN8wIGO/fqefek0kA3LRSZ2yrtIB4Y9v51FPg5QfIVOSwBIVu+cc4PX8qVtR3LWoard3Q2qgtxtCnB9Ow9BS6TCk12xudjBoyRnhgSqnhvx6His9laVVzIrsDwkakk/mBV3SyzXR3HkI27b0BIxgf98ihqyBMqWhZp8+WhzkAO2AO/WrymTH+pt/+/oqhboPOTcpZcjOOpzW5bwJ5CbyVbHIB4Fefivdlc9TBu8LFARWo5DJ/wB9Go7hLfyGYORwcBSTUkIlYHBXPqVqO7imS1bMikcDAGO9YQ1kkdNTSDZVVUhaKWMurL0JOaumfT7oD7RB5cg6TQHac+pH4frVJQPL5P0+tDACJXIGOjV7Njwbl4RWwJabUnuIQRiEk7j9ahv7sXO1VURxrwqjjj1NQj7p2HcPSoW+dgoHPpQkFxCGAyrEk9c9DViUuUhC7owIgPc4Joif7HPBNjeYnDEevtXSeJ/s0qWlzAG+YldxHBGMj+tZzny1Ixtuaxp80HK+xzsT7R87YYcq4H86047yG6UC9TEv8Nwp5/E9v89AMVmAGJiFAZD2NPjAfbsXnHrWjRiXjaooYXGoNJFxhVJyw9/WoZbmOKJ4raERIwwSTkmokgcZBwgPpQbfY2d2e9Fh3BWVAhxux7VsfZrw8rFbqPTk1hPEAhLnpzj0rpLW5uHtomFxwUB+57fSvPxq2Z6OBfxIxoOmdxx0wKbqP+oPJxwMHNSpCxj3Art/Kq+oIyWw3EEFu1c9HWojrraU5FAkhcipVcMCuOO4oABTBApBGQ2QeQeK9o8IHiXdlCytntUSu8chVyCc9cdasLlyGOAM0Phidw/GmAkhEiE4wf51s6gkr+HLRW/5ZlCPUcYH86ybaIyyxwoMvIwQe5JxXceIdHki8OTtHGoaIK3B5ABH9K48TNRnBeZ2YeF4TfkcaqIx5G4jrg8VIkSheFwQfWoEmOzJ4JFSq3GCTk12WOMcrKrDPII71E0wLHCEijcC/I6etIzjjGe/WlYBhcuW3jGRWvpgV7GInbwCOT6HFYrMQ3GPxqWC6EcYXLcE9D71zYmnzxR14WpySdzQ810t0I2qTkYz+tV75xNCg3huexzVKKZSY9vQkhlzkYqeVoTtES7SOuM4rioRtUR34iX7pkGMMMngUqLvfjgHnNLIAMAcetPQEhQPlHrXrI8UbtKYCEEehpjKucsd5z3p/l+YfmJxzzR9lUDKMc1SA1vB8KTa9C8u3bCC4zjGR0/U16NcCOe3kg3ApKpQgY6EVxXg2zuY4priFDMzPs+6MYA9/rXcackpUpc2sQOOpK142L96pe+x62F92nZrc8kntZIJ5IZsKYnKkeuDTSjADa2QRwDXTePdPjstZ8yLaEuE3nHQHof8+9c/AVdlx06ZFerCfPBSPMnHlk4kCnOAw4P86V8dD0qaWIgY+8B0NRtkffGCO9WQQhflzUO3Pr+VWW+7xTBt7miw0ben2trsG6GPPTlOn6VV1pIoZ40hVFG3PyDHerVriPAHbvzVPVTm5XJzhQORjFePhU3Vuexi3akUyCx5PanEEAAdutOAy5I4pwHY9SOteueMRqxMZwMGhH+UkL9fan/cIB54qMDGR2P86YHpvgSBRoFuzLkyF2J29snrXXWkUMhAU9uuKzPCdrt8PWEXO1rdD+YBP866eytQqqAPu8ZNeJJc02z2OZQgkef/ABY0qM6Ta3aqd0c2zOccMD/VRXmisY1Hl846gV7l8TdPWbwXetjLRFJAMejDP6E14k2QAFxkV6eGTULM82tLmlcillkKnKHOe1MkaR0HyADHc1PhzuGSOKaiYByTXQYlbZJjG4fQCjAHBBJqZ1wOuMGocA/3vzoA20uQqglGbjoAKy7+bzLkuFIHAwe1CzbT8x/OoJX3yk+pOK8zCxtNs9bGS9xIlU/KWz0NPUjn3qsDgEDp6VKh459K9I8odIcsMULgscelISTkikBxkDr3piPdvC3/ACB7D92SPIj/APQRXV2uGThWAPvXHeEZQdHsSGH+ojGC3+yK7SyOYxx+Rry4R95ndXfuooeLrfz/AAtqkIGS1rJj6hSR+tfOLsu04PNfUU8azQvG/wB11Kn6GvmC6VUuJYQOEZlz64Nd9LscTEVyc569KYzckLznrUXOQCe3WjdjIHX3rYQhHHPUHmk2j0pCCTjOM0o6f/WpAIsWe2SfaowPn57Zq6kSdNwOeehqkvfmvPwurZ6WL0ihHGeV6ipI3wuSM9KaMhvbPNSADnHTrXceeAIJIU/hTlX58ADmmSIQwKihS+AcYz6UxHs/gydP7JsQ6jiFBkfSu6gZEtmZDkAZ96818IXBXSrMbSSIwM13Nhdbo9r8AjFeYp2kzvnTbije6r+FfM+tII9Vu06YmkH/AI8a+k4rhHXg183+K4/L8R6nGSQVupR/4+a7aUk9jhatuZB7HPSkj5O496DjaOcnpSjhQMdRW9yQHr71G7EMQG4p7kdAO/Wo269TSGToXJOC/A7DNV06HPpmtASr5D5GSAepNZ6HJP0rhwr3PQxfQUnjj61KPu8GoOfxxilDgA5ya7DhJt3X2pR1HpUCyEKTt4HeniRWHXkgU7iPTfC04GkWo3Lwg7ZrrrCdgF3PHz71xvhjzl0m0ZAxUoBwD/hXTW80m0ZJz/tcf0rxJy99nsJe6joYr3ZkMw+uOK8Q+IKmLxhqJjO5XkD8f7Sg/wBa9TkuGCkYBP8As4/pXl3j4f8AFQSOSMtGhOPpj+ldeFleVjkxELRuc4rblOwj8eKaWkU5ADCmbOSV9aG3Bq9E4RS5XBZcUnmCg5KkMBTdlIDTkiVbWX5CCFJ4AFZtu4Ynmr7wxiCT5CflJBL+31rJYFWLLXDhdmeji1qi0yA9zSoAoHHBNRJPuAzUynK9ODXYcAuMAj1qDy1Dck1L0ziogTux3xTA7vw3IF0uD94QduMeZjua3Ibtk5WRyfY5rC8NSz/2Pb+X5fAb7xI/iNakbXjPh5oEUf3OT+teJUfvs9qC9xGobuWQfMZCO2R/9auF8c/Nq0Z6kwjk/wC8a6vaGIEk0sp9A4A/SuP8bER3sWxQuYz078mt8LL94YYmP7swTwSPfNNdhuOKge4KN8+ee9M+1KQRtJNerc8smkmVcjvioDOCc0xN0rZI4x3pCCDikBuzAC2lIU/dPPP+FZg6n0rSn4tpOx296zUbnkVxYbZno4r4kQMpVsjNTxzlRhumakERYDjNRCLg5Heus4idSGBKng0w8PyO1RZMY4/Gl8wHknBouTY7Tw1KV0yP58AbuCT6mtcSOy54OOnLc/pXOeHm3aWpJTAY8MM1rwOm3DeQv1GK8Ss7VH6ntUvgRbEpwAUUjrwWrl/GZDXNuSAPkI478/8A166ApEXy0qgeiACud8X7FNsYwx+9nOT6VphpL2iM8Sm6bOeAUsN3I6U1FQH3pwIJB6ikKHcfzr2DyBdwAzUe70p2DhvTFRAECgRrzPKLZ0ZDsxjJIOKyz8jHafeiiuLD/Cz0MV8SLlpOoTD8e9IZY8kZGMkUUV1HIQSsDnByM4qFV5ycUUU0B0OkXAt7VI8nDucdOK1Jbg2oDzYKsQBt7UUV5FZJ1GetS+BD5L+KORlLZK4yB79KyPEU4ltonGeGI5x6e30oop0IpVIsiu702jAiLFgM96uYHeiivXPIGNtBb0xVZ8hjg8UUUAf/2Q=="};
const NAMES = ["Jamal", "Ronny", "Pubes", "Muss", "Pit", "Saleh", "Aoc", "Joe", "Moe", "Chuck"];
const JERSEYS = ["#FF2D95", "#22E4E4", "#FFC53D", "#7C5CFF", "#4ADE80", "#FF7A45", "#38BDF8", "#F472B6", "#A3E635", "#FB7185"];
const SKINS = ["#E8B98A", "#C98B5E", "#8C5A33", "#F2CBA0", "#6E4526"];
const CONFETTI_COLORS = ["#FF2D95", "#22E4E4", "#FFC53D", "#7C5CFF", "#4ADE80", "#F5EDE4"];
const ROULETTE_ICONS = ["🚀", "💥", "🍌", "🔥", "💩", "🌀", "⚡", "🔀", "🚀"];

const FINISH = 1000;
const TICK_MS = 100;
const BASE_SPEED = 0.86;
const LANE_H = 62;
const KART_PAD = 108;

function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function rand(min, max) { return min + Math.random() * (max - min); }
function fmt(s, vars) { return s.replace(/\{(\w+)\}/g, function (_, k) { return vars[k]; }); }

const ITEMS = [
  { t: "rocket", w: 3, icon: "🚀" },
  { t: "seeker", w: 2, icon: "💥" },
  { t: "banana", w: 2, icon: "🍌" },
  { t: "boost", w: 3, icon: "🔥" },
  { t: "pigeon", w: 2, icon: "💩" },
  { t: "portal", w: 2, icon: "🌀" },
  { t: "bolt", w: 1, icon: "⚡" },
  { t: "switcheroo", w: 1, icon: "🔀" },
];

const LEAD_LINES = [
  "{t} TAKES THE LEAD.",
  "NEW LEADER: {t}.",
  "{t} to the front! This race is chaos.",
  "{t} seizes P1 like he pays rent there.",
  "{t} out front — for now. Nothing is safe.",
];
const FINISH_LINES = ["{t} crosses the line — P{p}.", "{t} home in P{p}.", "P{p} locked for {t}."];

function makeSfx() {
  let ctx = null;
  function ensure() {
    try {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) ctx = new AC();
      }
      if (ctx && ctx.state === "suspended") ctx.resume();
    } catch (e) { ctx = null; }
    return ctx;
  }
  function tone(freq, dur, type, gain, when) {
    dur = dur || 0.12; type = type || "square"; gain = gain || 0.05; when = when || 0;
    const c = ensure(); if (!c) return;
    try {
      const o = c.createOscillator(); const g = c.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(gain, c.currentTime + when);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + when + dur);
      o.connect(g); g.connect(c.destination);
      o.start(c.currentTime + when); o.stop(c.currentTime + when + dur + 0.02);
    } catch (e) {}
  }
  function sweep(f0, f1, dur, type, gain) {
    dur = dur || 0.25; type = type || "sawtooth"; gain = gain || 0.045;
    const c = ensure(); if (!c) return;
    try {
      const o = c.createOscillator(); const g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f0, c.currentTime);
      o.frequency.exponentialRampToValueAtTime(f1, c.currentTime + dur);
      g.gain.setValueAtTime(gain, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
      o.connect(g); g.connect(c.destination);
      o.start(); o.stop(c.currentTime + dur + 0.02);
    } catch (e) {}
  }
  function fanfare() { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.22, "square", 0.05, i * 0.16); }); }
  function sting() { [420, 300, 210, 140].forEach(function (f, i) { tone(f, 0.24, "sawtooth", 0.055, i * 0.18); }); }
  return { tone: tone, sweep: sweep, fanfare: fanfare, sting: sting, ensure: ensure };
}

const MUSIC_YT_ID = "VXuXBLlfxRo";

function makeMusic(getCtx, startOn) {
  let on = startOn !== false;
  let mode = null;
  let player = null;
  let probing = false;
  let synth = null;
  let fast = false;

  function midiHz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  const BASS = [
    40, 40, 47, 40, 40, 52, 47, 40,
    36, 36, 43, 36, 36, 48, 43, 36,
    38, 38, 45, 38, 38, 50, 45, 38,
    35, 35, 42, 35, 35, 42, 47, 50,
  ];
  const LEAD = [
    76, 0, 79, 76, 0, 83, 79, 0,
    72, 0, 76, 72, 0, 79, 76, 0,
    74, 0, 78, 74, 0, 81, 78, 0,
    71, 0, 74, 78, 0, 83, 0, 86,
  ];

  function makeSynth() {
    const c = getCtx();
    if (!c) return null;
    const master = c.createGain();
    master.gain.value = on ? 0.14 : 0.0001;
    master.connect(c.destination);
    let step = 0, nextT = 0, timer = null;
    function blip(freq, t, dur, type, g) {
      try {
        const o = c.createOscillator(); const gn = c.createGain();
        o.type = type; o.frequency.value = freq;
        gn.gain.setValueAtTime(g, t);
        gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(gn); gn.connect(master);
        o.start(t); o.stop(t + dur + 0.02);
      } catch (e) {}
    }
    function tick() {
      const e8 = 60 / (fast ? 168 : 146) / 2;
      while (nextT < c.currentTime + 0.4) {
        const i = step % 32;
        blip(midiHz(BASS[i]), nextT, e8 * 0.95, "triangle", 0.5);
        blip(midiHz(BASS[i]) * 2, nextT, e8 * 0.5, "sawtooth", 0.12);
        if (LEAD[i]) {
          blip(midiHz(LEAD[i]), nextT, e8 * 0.9, "square", 0.22);
          if (fast) blip(midiHz(LEAD[i] + 12), nextT, e8 * 0.9, "square", 0.1);
        }
        if (i % 4 === 0) blip(70, nextT, 0.09, "sine", 0.9);
        if (i % 8 === 4) blip(3000, nextT, 0.05, "square", 0.05);
        blip(7800, nextT + e8 / 2, 0.03, "square", 0.03);
        step++; nextT += e8;
      }
    }
    return {
      play: function () {
        if (timer) return;
        if (c.state === "suspended") c.resume();
        nextT = c.currentTime + 0.06;
        tick();
        timer = setInterval(tick, 120);
      },
      pause: function () { if (timer) { clearInterval(timer); timer = null; } },
      setOn: function (v) { master.gain.setTargetAtTime(v ? 0.14 : 0.0001, c.currentTime, 0.15); },
    };
  }

  function startSynth() {
    if (mode === "yt") return;
    mode = "synth";
    if (!synth) synth = makeSynth();
    if (synth && on) synth.play();
  }

  function loadYT(cb) {
    if (window.YT && window.YT.Player) return cb(true);
    let done = false;
    const t = setTimeout(function () { if (!done) { done = true; cb(false); } }, 4000);
    window.onYouTubeIframeAPIReady = function () { if (!done) { done = true; clearTimeout(t); cb(true); } };
    try {
      const sc = document.createElement("script");
      sc.src = "https://www.youtube.com/iframe_api";
      sc.onerror = function () { if (!done) { done = true; clearTimeout(t); cb(false); } };
      document.head.appendChild(sc);
    } catch (e) { if (!done) { done = true; clearTimeout(t); cb(false); } }
  }

  function start() {
    if (mode === "synth") { if (on && synth) synth.play(); return; }
    if (mode === "yt") { try { player.seekTo(0); if (on) player.playVideo(); } catch (e) {} return; }
    if (probing) return;
    probing = true;
    let settled = false;
    const fallback = function () { if (settled) return; settled = true; startSynth(); };
    const guard = setTimeout(fallback, 6000);
    loadYT(function (ok) {
      if (!ok) return fallback();
      try {
        const host = document.createElement("div");
        host.style.cssText = "position:fixed;left:-9999px;top:0;width:200px;height:112px;pointer-events:none;";
        const mount = document.createElement("div");
        host.appendChild(mount);
        document.body.appendChild(host);
        player = new window.YT.Player(mount, {
          width: 200, height: 112, videoId: MUSIC_YT_ID,
          playerVars: { autoplay: 1, loop: 1, playlist: MUSIC_YT_ID, controls: 0, disablekb: 1, playsinline: 1 },
          events: {
            onReady: function (ev) { ev.target.setVolume(65); if (on) ev.target.playVideo(); else ev.target.pauseVideo(); },
            onStateChange: function (ev) {
              if (ev.data === 1 && !settled) { settled = true; clearTimeout(guard); mode = "yt"; }
              if (ev.data === 0) { try { ev.target.seekTo(0); ev.target.playVideo(); } catch (e) {} }
            },
            onError: function () { clearTimeout(guard); fallback(); },
          },
        });
      } catch (e) { clearTimeout(guard); fallback(); }
    });
  }

  function stop() {
    if (mode === "yt" && player) { try { player.pauseVideo(); } catch (e) {} }
    if (synth) synth.pause();
  }

  return {
    start: start,
    stop: stop,
    setOn: function (v) {
      on = v;
      if (mode === "yt" && player) { try { if (v) player.playVideo(); else player.pauseVideo(); } catch (e) {} }
      if (synth) { synth.setOn(v); if (v && mode === "synth") synth.play(); }
    },
    setFast: function (v) { fast = v; },
  };
}

function FallbackFace({ skin }) {
  return (
    <svg viewBox="0 0 54 54" aria-hidden="true" style={{ width: "100%", height: "100%" }}>
      <rect width="54" height="54" fill={skin} />
      <circle cx="19" cy="24" r="3.5" fill="#000" />
      <circle cx="35" cy="24" r="3.5" fill="#000" />
      <path d="M18 36 Q27 43 36 36" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function RatMobile({ color }) {
  return (
    <svg width="88" height="46" viewBox="0 0 88 46" aria-hidden="true" style={{ position: "absolute", left: 0, top: 0 }}>
      <g className="tail">
        <path d="M18 24 C 7 22, 4 13, 11 8" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
      <ellipse cx="42" cy="25" rx="27" ry="13" fill={color} stroke="#000" strokeWidth="2" />
      <circle cx="58" cy="4" r="5.5" fill={color} stroke="#000" strokeWidth="2" />
      <circle cx="74" cy="6" r="5.5" fill={color} stroke="#000" strokeWidth="2" />
      <circle cx="58" cy="4" r="2.4" fill="#FFB3C7" />
      <circle cx="74" cy="6" r="2.4" fill="#FFB3C7" />
      <circle cx="84" cy="19" r="3" fill="#FFB3C7" stroke="#000" strokeWidth="1.5" />
      <line x1="82" y1="14" x2="88" y2="11" stroke="#fff" strokeWidth="1" opacity="0.7" />
      <line x1="83" y1="22" x2="88" y2="24" stroke="#fff" strokeWidth="1" opacity="0.7" />
      <g className="wheel">
        <circle cx="28" cy="39" r="7" fill="#111" stroke="#000" strokeWidth="2" />
        <line x1="28" y1="33.5" x2="28" y2="44.5" stroke="#666" strokeWidth="2" />
        <line x1="22.5" y1="39" x2="33.5" y2="39" stroke="#666" strokeWidth="2" />
      </g>
      <g className="wheel">
        <circle cx="60" cy="39" r="7" fill="#111" stroke="#000" strokeWidth="2" />
        <line x1="60" y1="33.5" x2="60" y2="44.5" stroke="#666" strokeWidth="2" />
        <line x1="54.5" y1="39" x2="65.5" y2="39" stroke="#666" strokeWidth="2" />
      </g>
    </svg>
  );
}

function StatRow({ label, val }) {
  return (
    <div className="gp-stat">
      <span>{label}</span>
      {[1, 2, 3, 4, 5].map(function (i) { return <div key={i} className={"gp-dot" + (i <= val ? " on" : "")} />; })}
    </div>
  );
}

export default function RatzGrandPrix() {
  const [phase, setPhase] = useState("setup");
  const [racers, setRacers] = useState([]);
  const [feed, setFeed] = useState([]);
  const [flash, setFlash] = useState(null);
  const [running, setRunning] = useState(false);
  const [clock, setClock] = useState(0);
  const [lap, setLap] = useState(1);
  const [slowmo, setSlowmo] = useState(false);
  const [finalLap, setFinalLap] = useState(false);
  const [leaderId, setLeaderId] = useState(null);
  const [champ, setChamp] = useState(null);
  const [jeansCard, setJeansCard] = useState(null);
  const [launchOn, setLaunchOn] = useState(false);
  const [trackFx, setTrackFx] = useState({ rows: [], bursts: [], projectiles: [], pendingByRid: {}, warpIds: {}, shakeIds: {}, sinkIds: {}, zap: false, jeans: null });
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(true);
  const [gridStats, setGridStats] = useState({});
  const [copied, setCopied] = useState(false);
  const sfxRef = useRef(null);
  const musicRef = useRef(null);
  const soundRef = useRef(true);
  soundRef.current = soundOn;
  const stateRef = useRef({});

  useEffect(function () { if (musicRef.current) musicRef.current.setOn(musicOn); }, [musicOn]);

  function sfx() {
    if (soundRef.current && sfxRef.current) return sfxRef.current;
    return { tone: function () {}, sweep: function () {}, fanfare: function () {}, sting: function () {} };
  }
  function say(text, big) {
    setFeed(function (prev) { return [{ id: Date.now() + Math.random(), text: text, big: big }].concat(prev).slice(0, 60); });
  }
  function slam(text) {
    setFlash(null);
    requestAnimationFrame(function () { setFlash(text); });
    setTimeout(function () { setFlash(null); }, 950);
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function makeRacers() {
    return NAMES.map(function (name, i) {
      return {
        id: i, name: name,
        img: FACES[name] || null,
        color: JERSEYS[i % JERSEYS.length],
        skin: SKINS[i % SKINS.length],
        progress: 0,
        base: rand(0.94, 1.06),
        mo: { kind: "cruise", mult: 1, until: 0 },
        effect: null, place: null,
      };
    });
  }

  async function startSequence() {
    if (!sfxRef.current) sfxRef.current = makeSfx();
    if (!musicRef.current) musicRef.current = makeMusic(sfxRef.current.ensure, musicOn);
    musicRef.current.setFast(false);
    musicRef.current.start();
    const rs = makeRacers();
    const stats = {};
    rs.forEach(function (r) { stats[r.name] = { spd: Math.floor(rand(2, 6)), lck: Math.floor(rand(1, 6)), chs: Math.floor(rand(2, 6)) }; });
    setGridStats(stats);
    const plan = [];
    if (Math.random() < 0.85) plan.push(rand(380, 600));
    if (Math.random() < 0.45) plan.push(rand(660, 850));
    plan.sort(function (a, b) { return a - b; });
    stateRef.current = {
      racers: rs,
      rows: [], pending: [], projectiles: [], impacts: [], bursts: [],
      warpIds: {}, shakeIds: {}, sinkIds: {},
      nextRowAt: 0, rowSeq: 0, lastFireAt: 0, zapUntil: 0,
      leaderId: null,
      comebackId: pick(rs).id, comebackFired: false,
      nextPlace: 1, start: 0,
      finalLap: false, slowmo: false, photoDone: false, halfSaid: false,
      breakSaid: false, closeSaid: false,
      jeansPlaced: false, jeansDone: false, jeansPos: 0, jeansOwner: null,
      sewerPlan: plan, sewerQ: [], rankSnap: {}, rankSnapAt: 0, fallSlamAt: {},
    };
    setRacers(rs.slice());
    setFeed([]);
    setLap(1); setFinalLap(false); setSlowmo(false); setLeaderId(null);
    setTrackFx({ rows: [], bursts: [], projectiles: [], pendingByRid: {}, warpIds: {}, shakeIds: {}, sinkIds: {}, zap: false, jeans: null });
    setPhase("grid");
    sfx().sweep(120, 500, 0.6, "sawtooth", 0.04);

    await sleep(NAMES.length * 420 + 1400);
    setPhase("race");
    slam("3"); sfx().tone(392, 0.18); await sleep(900);
    slam("2"); sfx().tone(392, 0.18); await sleep(900);
    slam("1"); sfx().tone(392, 0.18); await sleep(900);
    slam("GO!!!"); sfx().tone(784, 0.4, "square", 0.06); sfx().sweep(200, 900, 0.5);
    setLaunchOn(true);
    setTimeout(function () { setLaunchOn(false); }, 750);
    say("Green flag! Ten rat mobiles, three laps, one first pick. Grab the boxes, ruin your friends.", true);
    const s = stateRef.current;
    s.start = Date.now();
    s.nextRowAt = Date.now() + rand(4500, 6500);
    setRunning(true);
  }

  function weightedItem(finalLapNow) {
    const pool = [];
    ITEMS.forEach(function (it) {
      let w = it.w;
      if (finalLapNow && (it.t === "seeker" || it.t === "rocket")) w += 2;
      for (let i = 0; i < w; i++) pool.push(it);
    });
    return pick(pool);
  }

  function launchProjectile(s, c, vid, icon, now, impact) {
    s.projectiles.push({ id: now + Math.random(), icon: icon, vid: vid, fromP: c.progress, fromLane: c.id, born: now, color: c.color });
    const im = { at: now + 480, vid: vid, aname: c.name, aicon: icon };
    Object.keys(impact).forEach(function (k) { im[k] = impact[k]; });
    s.impacts.push(im);
    sfx().sweep(300, 900, 0.3);
  }

  function resolveItem(s, c, item, now) {
    const alive = s.racers.filter(function (r) { return r.place === null; });
    const ord = alive.slice().sort(function (a, b) { return b.progress - a.progress; });
    const aheadList = alive.filter(function (r) { return r.progress > c.progress && r.id !== c.id; }).sort(function (a, b) { return a.progress - b.progress; });
    const behindList = alive.filter(function (r) { return r.progress < c.progress && r.id !== c.id; }).sort(function (a, b) { return b.progress - a.progress; });
    const ahead = aheadList[0];
    const behind = behindList[0];
    const leader = ord[0];
    function boostSelf(msg) {
      c.effect = { kind: "boost", until: now + 2400, icon: "🔥" };
      say(msg, true);
      sfx().sweep(250, 1100, 0.35);
    }

    if (item.t === "rocket") {
      if (ahead) launchProjectile(s, c, ahead.id, "🚀", now, { kind: "stop", dur: 1700, icon: "🚀", burst: "💥", msg: c.name + " FIRES A ROCKET — " + ahead.name + " takes it in the tailpipe." });
      else boostSelf(c.name + " fires a rocket into open road and rides the exhaust. BOOST.");
    } else if (item.t === "seeker") {
      if (leader && leader.id !== c.id) launchProjectile(s, c, leader.id, "💥", now, { kind: "stop", dur: 2000, icon: "💥", burst: "💥", msg: c.name + " launches the HEAT SEEKER. " + leader.name + " was leading. Was." });
      else boostSelf(c.name + " grabs a seeker while leading — nothing to hunt. Converts to pure speed.");
    } else if (item.t === "banana") {
      if (behind) launchProjectile(s, c, behind.id, "🍌", now, { kind: "stop", dur: 1500, icon: "🍌", burst: "🍌", msg: c.name + " drops a banana right on " + behind.name + "'s line. Spinout." });
      else say(c.name + " drops a banana into the void. Nobody home.");
    } else if (item.t === "boost") {
      c.effect = { kind: "boost", until: now + 2600, icon: "🔥" };
      say(c.name + " slams the boost pad. GONE.", true);
      sfx().sweep(250, 1100, 0.35);
    } else if (item.t === "pigeon") {
      const targets = ord.slice(0, 3).filter(function (r) { return r.id !== c.id; });
      const v = targets.length ? pick(targets) : (ahead || behind);
      if (v) launchProjectile(s, c, v.id, "💩", now, { kind: "slow", dur: 2400, icon: "💩", burst: "💩", msg: c.name + " releases the pigeon. It finds " + v.name + ". Splat." });
    } else if (item.t === "portal") {
      const others = alive.filter(function (r) { return r.id !== c.id; });
      const v = ahead || (others.length ? pick(others) : null);
      if (v) {
        const tmp = c.progress; c.progress = v.progress; v.progress = tmp;
        s.warpIds[c.id] = now + 700; s.warpIds[v.id] = now + 700;
        slam(c.name + " 🌀 " + v.name);
        sfx().sweep(800, 200, 0.3);
        say(c.name + " portals with " + v.name + ". Positions traded, dignity lost.", true);
      }
    } else if (item.t === "switcheroo") {
      const rank = ord.findIndex(function (r) { return r.id === c.id; });
      if (leader && leader.id !== c.id && rank >= Math.floor(ord.length / 2)) {
        const tmp2 = c.progress; c.progress = leader.progress; leader.progress = tmp2;
        s.warpIds[c.id] = now + 700; s.warpIds[leader.id] = now + 700;
        s.fallSlamAt[leader.id] = now;
        slam(c.name + " 🔀 " + leader.name);
        say(c.name + " pulls the SWITCHEROO — trades lives with " + leader.name + ". The king is in the mud.", true);
        sfx().sweep(900, 150, 0.4);
      } else boostSelf(c.name + " fumbles the switcheroo. Consolation boost.");
    } else if (item.t === "bolt") {
      s.zapUntil = now + 550;
      slam(c.name + " ⚡ EVERYONE");
      say(c.name + " calls down LIGHTNING. Everyone else eats it.", true);
      alive.filter(function (r) { return r.id !== c.id; }).forEach(function (r) {
        s.impacts.push({ at: now + 260, vid: r.id, aname: c.name, aicon: "⚡", kind: "slow", dur: 1500, icon: "⚡", burst: "⚡", msg: null, silent: true });
      });
      sfx().tone(150, 0.18, "sawtooth", 0.055);
    }
  }

  useEffect(function () {
    if (!running) return;
    const id = setInterval(function () {
      const s = stateRef.current;
      const now = Date.now();
      const alive = s.racers.filter(function (r) { return r.place === null; });
      const mean = s.racers.reduce(function (a, r) { return a + Math.min(r.progress, FINISH); }, 0) / s.racers.length;
      const leadProg = Math.max.apply(null, s.racers.map(function (r) { return Math.min(r.progress, FINISH); }));
      const ordAlive = alive.slice().sort(function (a, b) { return b.progress - a.progress; });

      const curLap = Math.min(3, Math.floor(leadProg / 334) + 1);
      setLap(curLap);
      if (curLap === 3 && !s.finalLap) {
        s.finalLap = true;
        setFinalLap(true);
        slam("FINAL LAP");
        sfx().sweep(300, 1200, 0.5);
        if (musicRef.current) musicRef.current.setFast(true);
        say("FINAL LAP. Item boxes everywhere. Pray for your rat.", true);
      }

      // THE SEWER — a top rat plunges to dead last
      if (s.sewerPlan.length && leadProg >= s.sewerPlan[0] && s.nextPlace === 1 && ordAlive.length >= 4) {
        s.sewerPlan.shift();
        const sv = pick(ordAlive.slice(0, 2));
        sv.effect = { kind: "stop", until: now + 700, icon: "🕳️" };
        s.sinkIds[sv.id] = now + 750;
        s.sewerQ.push({ at: now + 700, vid: sv.id });
        s.bursts.push({ id: now + Math.random(), p: sv.progress, lane: sv.id, icon: "🕳️", until: now + 850 });
        slam(sv.name + " 🕳️ SEWER");
        sfx().sweep(600, 80, 0.6, "sawtooth", 0.06);
        say(sv.name + " found the ONE open manhole. He's going DOWN.", true);
      }
      const drops = s.sewerQ.filter(function (q) { return q.at <= now; });
      s.sewerQ = s.sewerQ.filter(function (q) { return q.at > now; });
      drops.forEach(function (q) {
        const v = s.racers.find(function (r) { return r.id === q.vid; });
        if (!v || v.place !== null) return;
        const aliveNow = s.racers.filter(function (r) { return r.place === null; });
        const oldRank = aliveNow.slice().sort(function (a, b) { return b.progress - a.progress; }).findIndex(function (r) { return r.id === v.id; }) + 1;
        const minP = Math.min.apply(null, aliveNow.map(function (r) { return r.progress; }));
        v.progress = Math.max(20, minP - 30);
        v.effect = { kind: "slow", until: now + 1000, icon: "💫" };
        v.mo = { kind: "cold", mult: 0.9, until: now + 1500 };
        s.fallSlamAt[v.id] = now;
        s.bursts.push({ id: now + Math.random(), p: v.progress, lane: v.id, icon: "💫", until: now + 750 });
        say(v.name + " spat out of the pipe in DEAD LAST. P" + oldRank + " → P" + aliveNow.length + ".", true);
        sfx().sweep(140, 700, 0.4, "square", 0.05);
      });

      // free-fall detector (skip the start-line scramble where ranks are noise)
      if (leadProg > 80 && now - s.rankSnapAt > 1200) {
        const ranks = {};
        ordAlive.forEach(function (r, i) { ranks[r.id] = i + 1; });
        Object.keys(ranks).forEach(function (idk) {
          const old = s.rankSnap[idk];
          if (old && ranks[idk] - old >= 4 && (!s.fallSlamAt[idk] || now - s.fallSlamAt[idk] > 8000)) {
            s.fallSlamAt[idk] = now;
            const rr = s.racers.find(function (x) { return String(x.id) === String(idk); });
            if (rr) {
              slam(rr.name + " FREE FALL");
              sfx().sweep(900, 110, 0.55, "sawtooth", 0.05);
              say(rr.name + " plummets P" + old + " → P" + ranks[idk] + ".", true);
            }
          }
        });
        s.rankSnap = ranks;
        s.rankSnapAt = now;
      }

      // spawn item box rows — one active at a time
      if (now >= s.nextRowAt && s.rows.length === 0 && alive.length > 1 && leadProg > 90 && leadProg < 880) {
        const midRat = ordAlive[Math.floor(ordAlive.length / 2)] || ordAlive[0];
        const anchor = Math.random() < 0.5 ? leadProg : midRat.progress;
        const pos = Math.max(140, Math.min(930, anchor + rand(60, 150)));
        s.rows.push({ id: s.rowSeq++, pos: pos, charges: 2, until: now + 9500, taken: {} });
        s.nextRowAt = now + (s.finalLap ? rand(3800, 5600) : rand(5200, 7800));
        sfx().tone(980, 0.08, "square", 0.03);
      }
      s.rows = s.rows.filter(function (row) { return row.charges > 0 && row.until > now; });

      // cursed jeans — once, late, last place only
      if (!s.jeansPlaced && !s.jeansDone && leadProg >= 700 && s.nextPlace === 1 && ordAlive.length >= 3) {
        const last = ordAlive[ordAlive.length - 1];
        s.jeansOwner = last.id;
        s.jeansPos = Math.min(last.progress + 55, 930);
        s.jeansPlaced = true;
        say("Something DENIM shimmers on the road... and only " + last.name + " can reach it.", true);
        sfx().sweep(90, 400, 0.7, "sine", 0.05);
      }

      if (!s.halfSaid && mean > 500 && ordAlive.length) {
        s.halfSaid = true;
        say("Halfway report: " + ordAlive[0].name + " leads, " + ordAlive[ordAlive.length - 1].name + " is in the sewer. Plenty of race left.", true);
      }

      if (!s.comebackFired && mean > 550) {
        const kid = s.racers.find(function (r) { return r.id === s.comebackId && r.place === null; });
        if (kid) {
          const idx = ordAlive.findIndex(function (r) { return r.id === kid.id; });
          if (idx >= ordAlive.length - 3) {
            s.comebackFired = true;
            kid.mo = { kind: "hot", mult: 1.5, until: now + 6500 };
            kid.effect = { kind: "boost", until: now + 5200, icon: "😤" };
            slam("THE COMEBACK");
            sfx().sweep(180, 1000, 0.6);
            say(kid.name + " has been quiet all race. NOT ANYMORE. Here he comes.", true);
          } else {
            s.comebackFired = true;
          }
        }
      }

      if (ordAlive.length >= 2 && s.nextPlace === 1) {
        const gap = ordAlive[0].progress - ordAlive[1].progress;
        if (!s.breakSaid && gap > 160) {
          s.breakSaid = true;
          say(ordAlive[0].name + " has BROKEN AWAY — " + Math.round(gap) + "m clear of the field. Can anyone answer?", true);
        }
        if (s.breakSaid && !s.closeSaid && gap < 45) {
          s.closeSaid = true;
          say("The pack has CLOSED. " + ordAlive[0].name + "'s cushion is gone. It's a dogfight.", true);
        }
      }

      if (!s.photoDone && s.nextPlace === 1 && ordAlive.length >= 2) {
        if (ordAlive[0].progress > 920 && (ordAlive[0].progress - ordAlive[1].progress) < 26) {
          s.photoDone = true;
          s.slowmo = true;
          setSlowmo(true);
          slam("PHOTO FINISH");
          sfx().sweep(1000, 200, 0.8, "sine", 0.05);
          say(ordAlive[0].name + " and " + ordAlive[1].name + " nose to nose at the line — SLOW MOTION.", true);
        }
      }

      // movement
      const phaseK = leadProg < 334 ? 0.02 : leadProg < 667 ? 0.15 : 1.6;
      const leaderNow = ordAlive.length ? ordAlive[0].id : null;
      alive.forEach(function (r) {
        if (r.effect && now > r.effect.until) r.effect = null;
        if (now > r.mo.until) {
          const roll = Math.random();
          if (roll < 0.25) r.mo = { kind: "hot", mult: rand(1.3, 1.6), until: now + rand(3500, 7000) };
          else if (roll < 0.5) r.mo = { kind: "cold", mult: rand(0.55, 0.75), until: now + rand(3000, 6000) };
          else r.mo = { kind: "cruise", mult: rand(0.95, 1.1), until: now + rand(2500, 5200) };
        }
        const oldP = r.progress;
        let v = BASE_SPEED * r.base * r.mo.mult;
        v *= 1 + ((mean - Math.min(r.progress, FINISH)) / FINISH) * phaseK;
        if (Math.min(r.progress, FINISH) < mean - 520) v *= 1.35;
        if (s.finalLap && s.nextPlace === 1) v *= r.id === leaderNow ? 0.9 : 1.08;
        if (r.effect) {
          if (r.effect.kind === "stop") v = 0;
          else if (r.effect.kind === "flat") v *= 0.04;
          else if (r.effect.kind === "slow") v *= 0.3;
          else if (r.effect.kind === "boost") v *= 2.1;
        }
        if (s.slowmo) v *= 0.32;
        r.progress += v;

        s.rows.forEach(function (row) {
          if (row.charges > 0 && !row.taken[r.id] && oldP < row.pos && r.progress >= row.pos) {
            row.charges--;
            row.taken[r.id] = true;
            s.pending.push({ rid: r.id, item: weightedItem(s.finalLap), fireAt: now + 800 });
            sfx().tone(1170, 0.07, "square", 0.045);
            for (let ti = 1; ti <= 4; ti++) sfx().tone(1400 + ti * 120, 0.03, "square", 0.02, ti * 0.14);
          }
        });

        if (s.jeansPlaced && r.id === s.jeansOwner && oldP < s.jeansPos && r.progress >= s.jeansPos) {
          s.jeansPlaced = false;
          s.jeansDone = true;
          const aliveJ = s.racers.filter(function (x) { return x.place === null; });
          const leadJ = aliveJ.slice().sort(function (a, b) { return b.progress - a.progress; })[0];
          if (leadJ && leadJ.id !== r.id) {
            s.projectiles.push({ id: now + Math.random(), icon: "👖", vid: leadJ.id, fromP: r.progress, fromLane: r.id, born: now, color: "#FFC53D" });
            s.impacts.push({ at: now + 480, vid: leadJ.id, aname: r.name, aicon: "👖", kind: "flat", dur: 5000, icon: "🛞", burst: "👖", msg: r.name + " pulls on THE CURSED JEANS. " + leadJ.name + " INSTANTLY BLOWS A TIRE. Five. Whole. Seconds." });
            sfx().sting();
            setJeansCard({ owner: r.name, victim: leadJ.name });
            setTimeout(function () { setJeansCard(null); }, 2800);
          }
        }

        if (r.progress >= FINISH && r.place === null) {
          r.place = s.nextPlace++;
          r.progress = FINISH;
          r.effect = null;
          s.bursts.push({ id: now + Math.random(), p: FINISH, lane: r.id, icon: "🏁", until: now + 700 });
          sfx().tone(500 + (11 - r.place) * 40, 0.15, "square", 0.05);
          say(fmt(pick(FINISH_LINES), { t: r.name, p: r.place }), r.place <= 3);
          if (r.place === 1) {
            slam(r.name + " WINS");
            if (s.slowmo) { s.slowmo = false; setSlowmo(false); }
          }
        }
      });

      // fire pending items — one at a time, min 900ms apart
      s.pending.sort(function (a, b) { return a.fireAt - b.fireAt; });
      if (s.pending.length && s.pending[0].fireAt <= now && now - s.lastFireAt >= 900) {
        const pnext = s.pending.shift();
        s.lastFireAt = now;
        const cc = s.racers.find(function (r) { return r.id === pnext.rid; });
        if (cc && cc.place === null) resolveItem(s, cc, pnext.item, now);
      }

      // land impacts
      const landing = s.impacts.filter(function (im) { return im.at <= now; });
      s.impacts = s.impacts.filter(function (im) { return im.at > now; });
      landing.forEach(function (im) {
        const v = s.racers.find(function (r) { return r.id === im.vid; });
        s.projectiles = s.projectiles.filter(function (pr) { return pr.vid !== im.vid || pr.born + 400 > now; });
        if (!v || v.place !== null) return;
        v.effect = { kind: im.kind, until: now + im.dur, icon: im.icon };
        s.shakeIds[v.id] = now + 420;
        s.bursts.push({ id: now + Math.random(), p: v.progress, lane: v.id, icon: im.burst, until: now + 620 });
        if (!im.silent) slam(im.aname + " " + im.aicon + " " + v.name);
        if (im.msg) say(im.msg, true);
        sfx().tone(150, 0.18, "sawtooth", 0.055);
      });

      // prune fx
      s.bursts = s.bursts.filter(function (b) { return b.until > now; });
      s.projectiles = s.projectiles.filter(function (pr) { return pr.born + 900 > now; });
      Object.keys(s.warpIds).forEach(function (k) { if (s.warpIds[k] <= now) delete s.warpIds[k]; });
      Object.keys(s.shakeIds).forEach(function (k) { if (s.shakeIds[k] <= now) delete s.shakeIds[k]; });
      Object.keys(s.sinkIds).forEach(function (k) { if (s.sinkIds[k] <= now) delete s.sinkIds[k]; });

      // lead change
      const stillRacing = s.racers.filter(function (r) { return r.place === null; });
      if (stillRacing.length && s.nextPlace === 1) {
        const leader = stillRacing.slice().sort(function (a, b) { return b.progress - a.progress; })[0];
        if (leader.id !== s.leaderId && leader.progress > 80) {
          s.leaderId = leader.id;
          setLeaderId(leader.id);
          sfx().tone(660, 0.08, "square", 0.03);
          say(fmt(pick(LEAD_LINES), { t: leader.name }));
        }
      }

      setClock(Math.floor((now - s.start) / 1000));
      setRacers(s.racers.slice());
      const pendingByRid = {};
      s.pending.forEach(function (p) { pendingByRid[p.rid] = true; });
      setTrackFx({
        rows: s.rows.map(function (row) { return { id: row.id, pos: row.pos, charges: row.charges, taken: Object.assign({}, row.taken) }; }),
        bursts: s.bursts.slice(),
        projectiles: s.projectiles.map(function (pr) { return { id: pr.id, icon: pr.icon, vid: pr.vid, fromP: pr.fromP, fromLane: pr.fromLane, color: pr.color, age: now - pr.born }; }),
        pendingByRid: pendingByRid,
        warpIds: Object.assign({}, s.warpIds),
        shakeIds: Object.assign({}, s.shakeIds),
        sinkIds: Object.assign({}, s.sinkIds),
        zap: s.zapUntil > now,
        jeans: s.jeansPlaced ? { pos: s.jeansPos, lane: s.jeansOwner } : null,
      });

      if (s.racers.every(function (r) { return r.place !== null; })) {
        setRunning(false);
        const winner = s.racers.find(function (r) { return r.place === 1; });
        sfx().fanfare();
        setChamp(winner);
        setTimeout(function () { setChamp(null); setPhase("results"); }, 3000);
      }
    }, TICK_MS);
    return function () { clearInterval(id); };
  }, [running]);

  const standings = racers.slice().sort(function (a, b) {
    if (a.place !== null && b.place !== null) return a.place - b.place;
    if (a.place !== null) return -1;
    if (b.place !== null) return 1;
    return b.progress - a.progress;
  });
  const order = racers.filter(function (r) { return r.place !== null; }).sort(function (a, b) { return a.place - b.place; });

  function copyOrder() {
    const text = order.map(function (r) { return r.place + ". " + r.name; }).join("\n");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        setCopied(true);
        setTimeout(function () { setCopied(false); }, 2000);
      });
    }
  }

  function reset() {
    setPhase("setup"); setRacers([]); setFeed([]); setRunning(false);
    setCopied(false); setChamp(null); setJeansCard(null);
    if (musicRef.current) musicRef.current.stop();
  }

  const confetti = [];
  for (let ci = 0; ci < 26; ci++) {
    confetti.push({
      left: (ci * 37) % 100,
      delay: ((ci * 53) % 20) / 10,
      dur: 2.4 + ((ci * 29) % 15) / 10,
      color: CONFETTI_COLORS[ci % CONFETTI_COLORS.length],
    });
  }

  function xOf(p) {
    return "calc((100% - " + KART_PAD + "px) * " + (Math.min(p, FINISH) / FINISH) + " + 36px)";
  }
  function kartLeft(p) {
    return "calc((100% - " + KART_PAD + "px) * " + (Math.min(p, FINISH) / FINISH) + ")";
  }

  return (
    <div className="gp-root">
      <style>{CSS}</style>
      <div className="gp-wrap">
        {phase === "setup" && (
          <div>
            <p className="gp-eyebrow">Team Ratz · fantasy draft order · decided at full speed</p>
            <h1 className="gp-title">Ratz Grand Prix</h1>
            <p className="gp-sub">
              Ten rat mobiles. Three laps. Item boxes on the road — drive through one, get a weapon,
              use it on your friends. Rockets, seekers, pigeons, portals, an open sewer with a taste
              for front-runners... and one cursed denim artifact only last place can touch.
              Finishing order is the draft order.
            </p>
            <div className="gp-entrants">
              {NAMES.map(function (n, i) {
                return (
                  <div className="gp-entrant" key={n}>
                    <div className="gp-face" style={{ borderColor: JERSEYS[i % JERSEYS.length] }}>
                      {FACES[n] ? <img src={FACES[n]} alt={n} /> : <FallbackFace skin={SKINS[i % SKINS.length]} />}
                    </div>
                    <span>{n}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button className="gp-btn" onClick={startSequence}>Start engines</button>
              <button className="gp-mute" onClick={function () { setSoundOn(function (v) { return !v; }); }} aria-label="Toggle sound">
                {soundOn ? "🔊 Sound on" : "🔇 Sound off"}
              </button>
              <button className="gp-mute" style={{ opacity: musicOn ? 1 : 0.45 }} onClick={function () { setMusicOn(function (v) { return !v; }); }} aria-label="Toggle music">
                {musicOn ? "🎵 Music on" : "🎵 Music off"}
              </button>
            </div>
            <p className="gp-foot">
              Best watched on a big screen. Every box, item, and hazard is rolled live by the browser's
              random number generator — grid stats are decorative propaganda. First official race is final.
              Background track streams from YouTube; if it can't load where you're running this, an
              original backup synth loop takes over automatically.
            </p>
          </div>
        )}

        {phase === "grid" && (
          <div>
            <p className="gp-eyebrow">Broadcast intro</p>
            <h1 className="gp-title">Starting Grid</h1>
            <div className="gp-grid">
              {NAMES.map(function (n, i) {
                const st = gridStats[n] || { spd: 3, lck: 3, chs: 3 };
                return (
                  <div className="gp-gridcard" key={n} style={{ animationDelay: (i * 0.42) + "s" }}>
                    <div className="gp-face" style={{ borderColor: JERSEYS[i % JERSEYS.length] }}>
                      {FACES[n] ? <img src={FACES[n]} alt={n} /> : <FallbackFace skin={SKINS[i % SKINS.length]} />}
                    </div>
                    <div>
                      <div className="gp-gc-name">{n}</div>
                      <StatRow label="SPD" val={st.spd} />
                      <StatRow label="LCK" val={st.lck} />
                      <StatRow label="CHS" val={st.chs} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {phase === "race" && (
          <div>
            <div className="gp-hud">
              <h2 className="gp-title" style={{ fontSize: "clamp(22px,5vw,36px)" }}>Ratz Grand Prix</h2>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <span className="gp-hud-stat">Lap <b className={finalLap ? "final" : ""}>{lap}/3{finalLap ? " FINAL" : ""}</b></span>
                <span className="gp-hud-stat">Clock <b>{clock}s</b></span>
                <span className="gp-hud-stat">Home <b>{order.length}/{racers.length}</b></span>
                <button className="gp-mute" onClick={function () { setSoundOn(function (v) { return !v; }); }} aria-label="Toggle sound">{soundOn ? "🔊" : "🔇"}</button>
                <button className="gp-mute" style={{ opacity: musicOn ? 1 : 0.45 }} onClick={function () { setMusicOn(function (v) { return !v; }); }} aria-label="Toggle music">🎵</button>
              </div>
            </div>

            <div className={"gp-track" + (running ? " moving" : "") + (slowmo ? " slowmo" : "") + (finalLap ? " finalfx" : "") + (trackFx.zap ? " zap" : "")}>
              <div className="gp-finish" />
              <div className="gp-lapline" style={{ left: "calc((100% - " + KART_PAD + "px) * 0.334 + 44px)" }}><span>LAP 2</span></div>
              <div className="gp-lapline" style={{ left: "calc((100% - " + KART_PAD + "px) * 0.667 + 44px)" }}><span>FINAL LAP</span></div>

              {trackFx.rows.map(function (row) {
                return racers.map(function (r, i) {
                  if (r.place !== null || row.taken[r.id] || row.charges <= 0) return null;
                  return <div key={row.id + "-" + r.id} className="gp-box" style={{ left: xOf(row.pos), top: i * LANE_H + 20 }}>?</div>;
                });
              })}

              {trackFx.jeans && (
                <img className="gp-jeans-road" src={JEANS.icon} alt="mystery item"
                  style={{ left: xOf(trackFx.jeans.pos), top: trackFx.jeans.lane * LANE_H + 8 }} />
              )}

              {trackFx.projectiles.map(function (pr) {
                const v = racers.find(function (x) { return x.id === pr.vid; });
                const atP = pr.age < 90 || !v ? pr.fromP : v.progress;
                const atLane = pr.age < 90 || !v ? pr.fromLane : v.id;
                return (
                  <div key={pr.id} className="gp-proj"
                    style={{ left: xOf(atP), top: atLane * LANE_H + 14, filter: "drop-shadow(0 0 6px " + pr.color + ")" }}>
                    {pr.icon}
                  </div>
                );
              })}
              {trackFx.projectiles.map(function (pr) {
                const v = racers.find(function (x) { return x.id === pr.vid; });
                if (!v || v.place !== null) return null;
                return (
                  <div key={"ret-" + pr.id} className="gp-reticle"
                    style={{ left: "calc((100% - " + KART_PAD + "px) * " + (Math.min(v.progress, FINISH) / FINISH) + " + 40px)", top: v.id * LANE_H + 4, borderColor: pr.color }} />
                );
              })}

              {trackFx.bursts.map(function (b) {
                return <div key={b.id} className="gp-burst" style={{ left: xOf(b.p), top: b.lane * LANE_H + 10 }}>{b.icon}</div>;
              })}

              {racers.map(function (r) {
                let cls = "gp-kart";
                if (r.effect && r.effect.kind === "stop") cls += " spin halted";
                if (r.effect && r.effect.kind === "flat") cls += " flat halted";
                if (r.effect && r.effect.kind === "boost") cls += " boosting";
                if (trackFx.pendingByRid[r.id]) cls += " armed";
                if (leaderId === r.id && r.place === null) cls += " leader";
                if (trackFx.warpIds[r.id]) cls += " warp";
                if (trackFx.sinkIds[r.id]) cls += " sinkfx";
                if (trackFx.shakeIds[r.id]) cls += " shakefx";
                if (r.place !== null) cls += " finished";
                if (launchOn && r.place === null) cls += " launch";
                return (
                  <div className="gp-lane" key={r.id}>
                    <div className={cls} style={{ left: kartLeft(r.progress) }}>
                      <div className="k-anim">
                        <RatMobile color={r.color} />
                        <div className="k-face">{r.img ? <img src={r.img} alt="" /> : <FallbackFace skin={r.skin} />}</div>
                      </div>
                      <div className="k-name">{r.name}</div>
                      {leaderId === r.id && r.place === null && !r.effect && <div className="gp-crown">👑</div>}
                      {r.effect && <div className="gp-emote">{r.effect.icon}</div>}
                      {r.effect && (r.effect.kind === "stop" || r.effect.kind === "flat") && <div className="gp-smoke">💨</div>}
                      {trackFx.pendingByRid[r.id] && (
                        <div className="gp-roulette">
                          <div className="strip">
                            {ROULETTE_ICONS.map(function (ic, k) { return <span key={k}>{ic}</span>; })}
                          </div>
                        </div>
                      )}
                      {r.place !== null && <div className="gp-place-tag">P{r.place}</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="gp-standings">
              {standings.map(function (r, i) {
                const leadP = standings.find(function (x) { return x.place === null; });
                const gap = r.place === null && leadP && r.id !== leadP.id ? Math.round(leadP.progress - r.progress) : 0;
                return (
                  <div className={"gp-chip" + (i === 0 ? " p1" : "")} key={r.id}>
                    <div className="gp-face" style={{ borderColor: r.color }}>
                      {r.img ? <img src={r.img} alt="" /> : <FallbackFace skin={r.skin} />}
                    </div>
                    <b>{r.place !== null ? "P" + r.place : "#" + (i + 1)}</b>
                    <span>{r.name}{gap > 0 ? " +" + gap + "m" : ""}</span>
                  </div>
                );
              })}
            </div>

            <div className="gp-feed">
              {feed.map(function (l) {
                return <p key={l.id} className={"gp-line" + (l.big ? " big" : "")}><span className="tick">›</span> {l.text}</p>;
              })}
            </div>
          </div>
        )}

        {phase === "results" && (
          <div>
            <p className="gp-eyebrow">Checkered flag · final ruling</p>
            <h1 className="gp-title">The Order</h1>
            <ol className="gp-podium">
              {order.map(function (r) {
                return (
                  <li key={r.id}>
                    <span className="gp-pick">{String(r.place).padStart(2, "0")}</span>
                    <div className="gp-face" style={{ borderColor: r.color }}>
                      {r.img ? <img src={r.img} alt="" /> : <FallbackFace skin={r.skin} />}
                    </div>
                    <span className="gp-who">{r.name}</span>
                    {r.place === 1 && <span className="gp-tag">Wins pick 1</span>}
                    {r.place === order.length && <span className="gp-tag">Buried at pick {order.length}</span>}
                  </li>
                );
              })}
            </ol>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
              <button className="gp-btn" onClick={copyOrder}>{copied ? "Copied" : "Copy draft order"}</button>
              <button className="gp-ghost" onClick={reset}>Race again</button>
            </div>
            <p className="gp-foot">Screenshot this before anyone claims lag.</p>
          </div>
        )}
      </div>

      {flash && <div className="gp-flash"><b>{flash}</b></div>}

      {jeansCard && (
        <div className="gp-jcard" role="status">
          <img src={JEANS.card} alt="the cursed jeans" />
          <div className="gp-big-title">The Cursed Jeans</div>
          <div className="gp-big-sub">{jeansCard.owner} curses {jeansCard.victim} · flat tire · 5 seconds</div>
        </div>
      )}

      {champ && (
        <div className="gp-champ" role="status">
          {confetti.map(function (c, i) {
            return <span key={i} className="gp-confetti" style={{ left: c.left + "%", background: c.color, animationDelay: c.delay + "s", animationDuration: c.dur + "s" }} />;
          })}
          <div className="gp-face">
            {champ.img ? <img src={champ.img} alt="" /> : <FallbackFace skin={champ.skin} />}
          </div>
          <div className="gp-big-title">{champ.name}<br />Takes P1</div>
          <div className="gp-big-sub">First overall pick · Ratz Grand Prix champion</div>
        </div>
      )}
    </div>
  );
}
