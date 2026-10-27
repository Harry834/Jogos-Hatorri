import { createMines, reveal, toggleFlag } from "./mines-engine.js";

const $ = id => document.getElementById(id);
let game, flagMode = false, elapsed = 0, clockStarted = null, timer;
const time = () => { $("mines-time").textContent = String(Math.floor((elapsed + (clockStarted === null ? 0 : Date.now() - clockStarted)) / 1000)).padStart(3, "0"); };
function startClock() {
  if (game.status !== "playing" || document.hidden) return;
  if (clockStarted === null) clockStarted = Date.now();
  clearInterval(timer); timer = setInterval(time, 250); time();
}
function pauseClock() {
  if (clockStarted !== null) elapsed += Date.now() - clockStarted;
  clockStarted = null; clearInterval(timer); time();
}
function reset() {
  clearInterval(timer); elapsed = 0; clockStarted = null;
  const advanced = $("mines-level").value === "medium";
  game = createMines(advanced ? { size: 12, mines: 24 } : {});
  flagMode = false; $("flag-mode").setAttribute("aria-pressed", "false");
  $("flag-mode").textContent = "⚑ Marcar bandeira";
  time(); render();
}
function action(index, forceFlag = false) {
  if (flagMode || forceFlag) toggleFlag(game, index); else reveal(game, index);
  if (game.status === "playing") startClock(); else pauseClock();
  render();
}
function render() {
  $("mines-left").textContent = String(game.mines - game.flags).padStart(2, "0");
  $("mines-progress").textContent = `${game.opened}/${game.cells.length - game.mines}`;
  const board = $("mines-board"), focus = document.activeElement?.dataset?.cell;
  board.style.setProperty("--size", game.size); board.replaceChildren();
  for (const [index, cell] of game.cells.entries()) {
    const button = document.createElement("button");
    const end = game.status === "lost", mine = cell.mine && (cell.open || end), wrong = end && cell.flag && !cell.mine;
    button.type = "button"; button.dataset.cell = index;
    button.className = `mine-cell${cell.open ? " is-open" : ""}${cell.flag ? " is-flag" : ""}${mine ? " is-mine" : ""}${index === game.exploded ? " exploded" : ""}${wrong ? " wrong-flag" : ""}`;
    button.textContent = mine ? "✹" : wrong ? "×" : cell.flag ? "⚑" : cell.open && cell.adjacent ? cell.adjacent : "";
    button.dataset.value = cell.adjacent;
    const coordinate = `Linha ${Math.floor(index / game.size) + 1}, coluna ${index % game.size + 1}`;
    button.setAttribute("aria-label", `${coordinate}: ${mine ? "mina" : wrong ? "bandeira incorreta" : cell.flag ? "bandeira" : cell.open ? cell.adjacent ? `${cell.adjacent} minas próximas` : "vazia" : "fechada"}`);
    button.disabled = game.status === "won" || game.status === "lost";
    button.addEventListener("click", () => action(index));
    button.addEventListener("contextmenu", event => { event.preventDefault(); action(index, true); });
    button.addEventListener("keydown", event => {
      const offset = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -game.size, ArrowDown: game.size }[event.key];
      if (offset !== undefined) {
        const next = index + offset;
        if (next >= 0 && next < game.cells.length && (Math.abs(offset) > 1 || Math.floor(next / game.size) === Math.floor(index / game.size))) {
          event.preventDefault(); board.querySelector(`[data-cell="${next}"]`)?.focus();
        }
      } else if (event.key.toLowerCase() === "f") { event.preventDefault(); action(index, true); }
    });
    board.append(button);
  }
  if (focus !== undefined && game.status !== "won" && game.status !== "lost") board.querySelector(`[data-cell="${focus}"]`)?.focus({ preventScroll: true });
  $("mines-status").textContent = game.status === "won" ? "Campo limpo. Você venceu! ✨" : game.status === "lost" ? "Uma mina! Tente um novo campo." : game.status === "ready" ? "Escolha uma casa. O primeiro toque é seguro." : flagMode ? "Modo bandeira ativo. Toque para marcar ou desmarcar." : "Abra as casas seguras. Cada número conta as minas ao redor.";
}
$("mines-restart").addEventListener("click", reset);
$("mines-level").addEventListener("change", reset);
$("flag-mode").addEventListener("click", () => {
  flagMode = !flagMode; $("flag-mode").setAttribute("aria-pressed", String(flagMode));
  $("flag-mode").textContent = flagMode ? "✓ Bandeira ativa" : "⚑ Marcar bandeira";
  render();
});
document.addEventListener("visibilitychange", () => { if (document.hidden) pauseClock(); else startClock(); });
window.addEventListener("pagehide", pauseClock);
window.addEventListener("pageshow", startClock);
reset();
