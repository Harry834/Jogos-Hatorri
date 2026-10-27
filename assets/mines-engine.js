const validIndex = (game, index) => Number.isInteger(index) && index >= 0 && index < game.cells.length;

export function neighbors(game, index) {
  const row = Math.floor(index / game.size), col = index % game.size, result = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const r = row + dr, c = col + dc;
    if ((dr || dc) && r >= 0 && r < game.size && c >= 0 && c < game.size) result.push(r * game.size + c);
  }
  return result;
}

export function createMines({ size = 9, mines = 10, rng = Math.random } = {}) {
  if (!Number.isInteger(size) || size < 4 || size > 20 || !Number.isInteger(mines) || mines < 1 || mines > size * size - 9) throw new RangeError("Tabuleiro inválido.");
  if (typeof rng !== "function") throw new TypeError("Gerador aleatório inválido.");
  return { size, mines, rng, status: "ready", flags: 0, opened: 0, exploded: -1, cells: Array.from({ length: size * size }, () => ({ mine: false, adjacent: 0, open: false, flag: false })) };
}

function place(game, first) {
  const safe = new Set([first, ...neighbors(game, first)]), candidates = [];
  for (let i = 0; i < game.cells.length; i++) if (!safe.has(i)) candidates.push(i);
  for (let i = candidates.length - 1; i > 0; i--) {
    const value = game.rng();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new RangeError("Aleatoriedade inválida.");
    const j = Math.floor(value * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  for (const index of candidates.slice(0, game.mines)) game.cells[index].mine = true;
  for (let index = 0; index < game.cells.length; index++) game.cells[index].adjacent = neighbors(game, index).filter(n => game.cells[n].mine).length;
  game.status = "playing";
}

export function toggleFlag(game, index) {
  if (!validIndex(game, index) || game.status === "won" || game.status === "lost" || game.cells[index].open) return false;
  const cell = game.cells[index];
  if (!cell.flag && game.flags >= game.mines) return false;
  cell.flag = !cell.flag; game.flags += cell.flag ? 1 : -1;
  return true;
}

export function reveal(game, index) {
  if (!validIndex(game, index) || game.status === "won" || game.status === "lost") return false;
  const first = game.cells[index];
  if (first.open || first.flag) return false;
  if (game.status === "ready") place(game, index);
  if (first.mine) { first.open = true; game.status = "lost"; game.exploded = index; return true; }
  const queue = [index];
  while (queue.length) {
    const at = queue.pop(), cell = game.cells[at];
    if (cell.open || cell.flag || cell.mine) continue;
    cell.open = true; game.opened++;
    if (!cell.adjacent) for (const n of neighbors(game, at)) if (!game.cells[n].open && !game.cells[n].mine) queue.push(n);
  }
  if (game.opened === game.cells.length - game.mines) game.status = "won";
  return true;
}
