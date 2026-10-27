import { createGame, canPlay, playCard, drawCard, passTurn, botStep, cardLabel, COLOR_NAMES } from "./uno-engine.js";

const $ = id => document.getElementById(id);
const icons = { skip: "↷", reverse: "⇄", draw2: "+2", wild: "✦", draw4: "+4" };
const names = ["Você", "Bot 1", "Bot 2", "Bot 3"];
let game = createGame();
let timer = null;
let generation = 0;
let pendingWild = null;

function cardElement(card, button = false) {
  const element = document.createElement(button ? "button" : "div");
  element.className = `card ${card.color}`;
  if (button) element.type = "button";
  element.setAttribute("aria-label", cardLabel(card));
  const symbol = icons[card.value] || card.value;
  for (const cornerClass of ["corner", "corner bottom"]) { const corner = document.createElement("small"); corner.className = cornerClass; corner.textContent = symbol; corner.setAttribute("aria-hidden", "true"); element.append(corner); }
  const center = document.createElement("span"); center.className = "symbol"; center.textContent = symbol; center.setAttribute("aria-hidden", "true"); element.append(center);
  return element;
}

function render() {
  $("opponents").replaceChildren(...[1, 2, 3].map(player => {
    const wrapper = document.createElement("div"); wrapper.className = `opponent${game.turn === player && game.winner === null ? " active" : ""}`;
    const avatar = document.createElement("span"); avatar.className = "bot-avatar"; avatar.textContent = ["", "◈", "◇", "✳"][player]; avatar.setAttribute("aria-hidden", "true");
    const info = document.createElement("div"); const label = document.createElement("span"); label.className = "bot-name"; label.textContent = names[player];
    const count = document.createElement("span"); count.className = "bot-cards"; count.textContent = `${game.hands[player].length} cartas${game.hands[player].length === 1 ? " · UNO!" : ""}`;
    info.append(label, count); wrapper.append(avatar, info); return wrapper;
  }));
  $("top-card").replaceChildren(cardElement(game.discard.at(-1)));
  $("active-color").textContent = `COR: ${COLOR_NAMES[game.currentColor]}`;
  $("direction").textContent = game.direction === 1 ? "↻ SENTIDO HORÁRIO" : "↺ SENTIDO ANTI-HORÁRIO";
  $("deck-count").textContent = `${game.deck.length} CARTAS NO MONTE`;
  $("turn-badge").textContent = game.winner !== null ? game.winner === 0 ? "VOCÊ VENCEU!" : game.winner === -1 ? "EMPATE" : "FIM DA PARTIDA" : game.turn === 0 ? "SUA VEZ" : `${names[game.turn].toUpperCase()} ESTÁ JOGANDO`;
  $("turn-badge").classList.toggle("bot-turn", game.turn !== 0 && game.winner === null);
  $("status").textContent = game.message;
  $("hand-count").textContent = `(${game.hands[0].length}${game.hands[0].length === 1 ? " · UNO!" : ""})`;
  $("hand").replaceChildren(...game.hands[0].map((card, index) => {
    const element = cardElement(card, true); element.disabled = game.turn !== 0 || !canPlay(game, card, 0) || pendingWild !== null;
    element.classList.toggle("drawn", card.id === game.drawnId);
    element.addEventListener("click", () => selectCard(index)); return element;
  }));
  $("draw").disabled = game.turn !== 0 || game.winner !== null || !!game.drawnId || pendingWild !== null;
  $("pass").hidden = game.turn !== 0 || game.winner !== null || !game.drawnId;
}

function scheduleBot() {
  clearTimeout(timer);
  if (game.winner !== null || game.turn === 0 || document.hidden) return;
  const token = generation;
  timer = setTimeout(() => {
    if (token !== generation || game.winner !== null || game.turn === 0) return;
    botStep(game); render(); scheduleBot();
  }, 850);
}

function selectCard(index) {
  const card = game.hands[0][index];
  if (game.turn !== 0 || !canPlay(game, card, 0)) return;
  if (card.color === "wild") {
    pendingWild = { index, id: card.id, generation }; render();
    $("color-dialog").returnValue = "cancel";
    $("color-dialog").showModal();
    return;
  }
  playCard(game, index); render(); scheduleBot();
}

$("color-dialog").addEventListener("close", () => {
  const pending = pendingWild; pendingWild = null;
  if (pending && pending.generation === generation && game.hands[0][pending.index]?.id === pending.id && ["red", "yellow", "green", "blue"].includes($("color-dialog").returnValue)) playCard(game, pending.index, $("color-dialog").returnValue);
  render(); scheduleBot();
});
$("draw").addEventListener("click", () => { if (game.turn !== 0 || game.winner !== null || game.drawnId) return; drawCard(game); render(); scheduleBot(); });
$("pass").addEventListener("click", () => { if (game.turn !== 0 || !game.drawnId || game.winner !== null) return; passTurn(game); render(); scheduleBot(); });
$("restart").addEventListener("click", () => { generation++; clearTimeout(timer); pendingWild = null; if ($("color-dialog").open) $("color-dialog").close("cancel"); game = createGame(); render(); });
document.addEventListener("visibilitychange", () => { if (document.hidden) clearTimeout(timer); else scheduleBot(); });
window.addEventListener("pagehide", () => { generation++; clearTimeout(timer); });
window.addEventListener("pageshow", event => { if (event.persisted) { if (pendingWild) pendingWild.generation = generation; render(); scheduleBot(); } });
render();
