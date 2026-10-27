import { createMemory, flipMemory, settleMemory } from "./memory-engine.js";
const $ = id => document.getElementById(id);
let game, elapsed = 0, clockStarted = null, clock, pending, generation = 0;
function updateClock() { $("memory-time").textContent = String(Math.floor((elapsed + (clockStarted === null ? 0 : Date.now() - clockStarted)) / 1000)).padStart(3, "0"); }
function startClock() {
  if (game.status !== "playing" || document.hidden) return;
  if (clockStarted === null) clockStarted = Date.now();
  clearInterval(clock); clock = setInterval(updateClock, 250); updateClock();
}
function pauseClock() {
  if (clockStarted !== null) elapsed += Date.now() - clockStarted;
  clockStarted = null; clearInterval(clock); updateClock();
}
function suspend() {
  pauseClock(); clearTimeout(pending); generation++;
  if (game.pending) { settleMemory(game); render(); }
}
function reset() {
  clearInterval(clock); clearTimeout(pending); generation++; elapsed = 0; clockStarted = null;
  game = createMemory({ pairs: Number($("memory-level").value) });
  updateClock(); render();
}
function play(index) {
  if (!flipMemory(game, index)) return;
  if (game.status === "playing") startClock(); else pauseClock();
  if (game.pending) {
    const current = generation;
    pending = setTimeout(() => { if (current !== generation) return; settleMemory(game); render(); }, 850);
  }
  render();
}
function render() {
  $("memory-attempts").textContent = String(game.attempts).padStart(2, "0");
  $("memory-pairs").textContent = `${game.matches}/${game.pairs}`;
  const board = $("memory-board"), focused = document.activeElement?.dataset?.card;
  board.replaceChildren(); board.classList.toggle("six-pairs", game.pairs === 6);
  for (const [index, card] of game.cards.entries()) {
    const button = document.createElement("button");
    button.type = "button"; button.dataset.card = index;
    button.className = `memory-card${card.faceUp ? " is-flipped" : ""}${card.matched ? " is-matched" : ""}`;
    button.setAttribute("aria-label", `Carta ${index + 1}: ${card.matched ? `par encontrado ${card.symbol}` : card.faceUp ? card.symbol : "virada para baixo"}`);
    button.setAttribute("aria-pressed", String(card.faceUp));
    button.disabled = card.matched || game.status === "won";
    const back = document.createElement("span"), front = document.createElement("span");
    back.className = "card-back"; back.textContent = "+"; back.setAttribute("aria-hidden", "true");
    front.className = "card-front"; front.textContent = card.symbol; front.setAttribute("aria-hidden", "true");
    button.append(back, front); button.addEventListener("click", () => play(index));
    button.addEventListener("keydown", event => {
      const offset = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -4, ArrowDown: 4 }[event.key];
      if (offset !== undefined) {
        event.preventDefault();
        let next = index + offset;
        while (next >= 0 && next < game.cards.length && (Math.abs(offset) > 1 || Math.floor(next / 4) === Math.floor(index / 4))) {
          if (!game.cards[next].matched) { board.querySelector(`[data-card="${next}"]`)?.focus(); break; }
          next += offset;
        }
      }
    });
    board.append(button);
  }
  if (focused !== undefined) {
    const previous = Number(focused);
    let target = null;
    for (let step = 0; step < game.cards.length; step++) {
      const next = (previous + step) % game.cards.length;
      if (!game.cards[next].matched) { target = board.querySelector(`[data-card="${next}"]`); break; }
    }
    (target || $("memory-restart")).focus({ preventScroll: true });
  }
  $("memory-status").textContent = game.status === "won" ? `Todos os pares! Você venceu em ${game.attempts} tentativas. ✨` : game.pending ? "Não foi dessa vez. Memorize as cartas!" : game.selected.length ? "Agora encontre o par." : game.status === "ready" ? "Vire duas cartas para começar." : "Boa! Escolha o próximo par.";
}
$("memory-restart").addEventListener("click", reset);
$("memory-level").addEventListener("change", reset);
document.addEventListener("visibilitychange", () => { if (document.hidden) suspend(); else startClock(); });
window.addEventListener("pagehide", suspend);
window.addEventListener("pageshow", startClock);
reset();
