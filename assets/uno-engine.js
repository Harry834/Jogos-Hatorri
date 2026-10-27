export const COLORS = ["red", "yellow", "green", "blue"];
export const COLOR_NAMES = { red: "vermelho", yellow: "amarelo", green: "verde", blue: "azul" };

export function createDeck() {
  const cards = [];
  for (const color of COLORS) {
    cards.push({ id: `${color}-0`, color, value: "0" });
    for (const value of ["1", "2", "3", "4", "5", "6", "7", "8", "9", "skip", "reverse", "draw2"]) {
      for (let copy = 0; copy < 2; copy++) cards.push({ id: `${color}-${value}-${copy}`, color, value });
    }
  }
  for (const value of ["wild", "draw4"]) for (let copy = 0; copy < 4; copy++) cards.push({ id: `${value}-${copy}`, color: "wild", value });
  return cards;
}

export function shuffle(cards, rng = Math.random) {
  const result = [...cards];
  for (let i = result.length - 1; i > 0; i--) {
    const random = rng();
    if (!Number.isFinite(random) || random < 0 || random >= 1) throw new Error("Gerador aleatório inválido.");
    const j = Math.floor(random * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createGame(rng = Math.random) {
  const deck = shuffle(createDeck(), rng);
  const hands = Array.from({ length: 4 }, () => []);
  for (let round = 0; round < 7; round++) for (const hand of hands) hand.push(deck.pop());
  // O descarte inicial é sempre numérico: as ações começam na primeira jogada.
  const initialIndex = deck.findIndex(card => /^\d$/.test(card.value));
  const first = deck.splice(initialIndex, 1)[0];
  return { hands, deck, discard: [first], currentColor: first.color, turn: 0, direction: 1, drawnId: null, winner: null, idleTurns: 0, turns: 0, message: "Sua vez. Combine a cor ou o símbolo da carta central.", rng };
}

export function canPlay(state, card, player = state.turn) {
  if (state.winner !== null || player !== state.turn || !card || !state.hands[player]?.some(item => item.id === card.id)) return false;
  if (state.drawnId && card.id !== state.drawnId) return false;
  if (card.value === "draw4") return !state.hands[player].some(item => item.color === state.currentColor);
  if (card.color === "wild") return true;
  const top = state.discard.at(-1);
  return card.color === state.currentColor || card.value === top.value;
}

export function playableIndices(state) {
  return state.hands[state.turn].flatMap((card, index) => canPlay(state, card) ? [index] : []);
}

function takeOne(state) {
  if (!state.deck.length && state.discard.length > 1) {
    const top = state.discard.pop();
    state.deck = shuffle(state.discard, state.rng);
    state.discard = [top];
  }
  return state.deck.pop() || null;
}

function next(state, steps = 1) {
  state.turn = (state.turn + state.direction * steps + 8) % 4;
  state.drawnId = null;
  state.turns++;
}

export function playCard(state, index, chosenColor) {
  if (!Number.isInteger(index)) throw new Error("Carta inválida.");
  const card = state.hands[state.turn]?.[index];
  if (!canPlay(state, card)) throw new Error("Essa carta não pode ser jogada agora.");
  if (card.color === "wild" && !COLORS.includes(chosenColor)) throw new Error("Escolha uma cor para o coringa.");
  const player = state.turn;
  state.hands[player].splice(index, 1);
  state.discard.push(card);
  state.currentColor = card.color === "wild" ? chosenColor : card.color;
  state.idleTurns = 0;
  state.drawnId = null;
  let steps = 1;
  let extra = "";
  if (card.value === "reverse") { state.direction *= -1; extra = " Sentido invertido."; }
  if (card.value === "skip") { steps = 2; extra = " Próximo jogador pulado."; }
  if (card.value === "draw2" || card.value === "draw4") {
    const count = card.value === "draw2" ? 2 : 4;
    const target = (state.turn + state.direction + 4) % 4;
    let drawn = 0;
    for (let n = 0; n < count; n++) { const item = takeOne(state); if (item) { state.hands[target].push(item); drawn++; } }
    steps = 2;
    extra = ` Próximo jogador comprou ${drawn} e perdeu a vez.`;
  }
  state.message = `${player === 0 ? "Você jogou" : `Bot ${player} jogou`} ${cardLabel(card)}.${extra}`;
  if (state.hands[player].length === 1) state.message += " UNO!";
  if (!state.hands[player].length) { state.winner = player; state.message = player === 0 ? "Você venceu! A mesa é sua." : `Bot ${player} venceu. Vamos à revanche?`; }
  else next(state, steps);
  return state;
}

export function drawCard(state) {
  if (state.winner !== null || state.drawnId) throw new Error("Não é possível comprar agora.");
  const player = state.turn;
  const card = takeOne(state);
  if (!card) {
    state.idleTurns++;
    state.message = "Monte vazio. A vez foi passada.";
    next(state);
    if (state.idleTurns >= 4) { state.winner = -1; state.message = "Empate: ninguém tem como continuar."; }
    return state;
  }
  state.hands[player].push(card);
  state.idleTurns = 0;
  state.drawnId = card.id;
  if (canPlay(state, card)) state.message = `${player === 0 ? "Você comprou" : `Bot ${player} comprou`} uma carta que pode jogar. Jogue-a ou passe.`;
  else { state.message = `${player === 0 ? "Você comprou" : `Bot ${player} comprou`} uma carta e passou a vez.`; next(state); }
  return state;
}

export function passTurn(state) {
  if (state.winner !== null || !state.drawnId) throw new Error("Compre uma carta antes de passar.");
  state.message = `${state.turn === 0 ? "Você passou" : `Bot ${state.turn} passou`} a vez.`;
  next(state);
  return state;
}

export function chooseColor(hand) {
  return COLORS.reduce((best, color) => hand.filter(card => card.color === color).length > hand.filter(card => card.color === best).length ? color : best, COLORS[0]);
}

export function botStep(state) {
  if (state.winner !== null || state.turn === 0) return state;
  let indices = playableIndices(state);
  if (!indices.length) {
    const player = state.turn;
    drawCard(state);
    if (state.turn !== player || state.winner !== null) return state;
    indices = playableIndices(state);
    if (!indices.length) return passTurn(state);
  }
  const preferred = chooseColor(state.hands[state.turn]);
  indices.sort((a, b) => {
    const weight = card => (card.color === "wild" ? -3 : card.color === preferred ? 2 : 0) + (["draw2", "skip", "reverse"].includes(card.value) ? 1 : 0);
    return weight(state.hands[state.turn][b]) - weight(state.hands[state.turn][a]);
  });
  return playCard(state, indices[0], chooseColor(state.hands[state.turn]));
}

export function cardLabel(card) {
  const names = { skip: "pular", reverse: "inverter", draw2: "+2", wild: "coringa", draw4: "coringa +4" };
  return `${names[card.value] || card.value}${card.color === "wild" ? "" : ` ${COLOR_NAMES[card.color]}`}`;
}
