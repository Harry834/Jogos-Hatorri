export const MEMORY_SYMBOLS = ["🍄", "👾", "⚡", "🍒", "🚀", "💎", "🌙", "🎲"];

export function createMemory({ pairs = 8, rng = Math.random } = {}) {
  if (![6, 8].includes(pairs)) throw new RangeError("Escolha seis ou oito pares.");
  const symbols = [...MEMORY_SYMBOLS.slice(0, pairs), ...MEMORY_SYMBOLS.slice(0, pairs)];
  for (let i = symbols.length - 1; i > 0; i--) {
    const n = rng();
    if (!Number.isFinite(n) || n < 0 || n >= 1) throw new RangeError("Aleatoriedade inválida.");
    const j = Math.floor(n * (i + 1)); [symbols[i], symbols[j]] = [symbols[j], symbols[i]];
  }
  return { pairs, cards: symbols.map((symbol, id) => ({ id, symbol, faceUp: false, matched: false })), selected: [], attempts: 0, matches: 0, status: "ready", pending: false };
}

export function flipMemory(game, index) {
  if (game.status === "won" || game.pending || !Number.isInteger(index) || index < 0 || index >= game.cards.length) return false;
  const card = game.cards[index];
  if (card.faceUp || card.matched) return false;
  game.status = "playing"; card.faceUp = true; game.selected.push(index);
  if (game.selected.length === 2) {
    game.attempts++;
    const [a, b] = game.selected.map(i => game.cards[i]);
    if (a.symbol === b.symbol) {
      a.matched = b.matched = true; game.matches++; game.selected = [];
      if (game.matches === game.pairs) game.status = "won";
    } else game.pending = true;
  }
  return true;
}

export function settleMemory(game) {
  if (!game.pending) return false;
  for (const index of game.selected) game.cards[index].faceUp = false;
  game.selected = []; game.pending = false; return true;
}
