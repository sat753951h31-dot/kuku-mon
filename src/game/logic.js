export const state = {
  level: 1,
  monsterHp: 30,
  defeatedCount: 0,  // ★討伐数
  defeatedSummary: {},
  totalMonsters: 3,  // ★全体数
  currentMonsterImage: "",
  difficulty: "easy",
  mode: "add",
};

export function generateQuestion() {
  const mode = state.mode;        // mul / add / sub
  const diff = state.difficulty;  // easy / normal / hard
  const dan = state.dan || "all"; // ← UIから渡される段 ("1"〜"9" or "all")

  let a, b;

  // ▼ 段の決定（all ならランダム）
  const danValue = (dan === "all") ? Math.floor(Math.random() * 9) + 1 : Number(dan);

  // ▼ 掛け算（段 × 1〜9）
  if (mode === "mul") {
    a = danValue;
    b = Math.floor(Math.random() * 9) + 1;
    return { a, b, answer: a * b, op: "×" };
  }

  // ▼ 足し算・引き算の桁数設定
  let maxB = 9;

  if (diff === "normal") maxB = 99;  // 2桁
  if (diff === "hard")   maxB = 99;  // 2桁

  // ▼ a は段、b は難易度に応じて変化
  a = danValue;
  b = Math.floor(Math.random() * maxB) + 1;

  // ▼ 足し算
  if (mode === "add") {
    return { a, b, answer: a + b, op: "+" };
  }

  // ▼ 引き算（マイナス防止）
  if (mode === "sub") {
    const x = Math.max(a, b);
    const y = Math.min(a, b);
    return { a: x, b: y, answer: x - y, op: "-" };
  }
}


export function checkAnswer(question, userInput) {
  return Number(userInput) === question.answer;
}

export function updateScore(isCorrect) {
  if (isCorrect) state.score += 10;
  else state.score -= 5;
}

export function damageMonster(amount = 5) {
  state.monsterHp -= amount;
  if (state.monsterHp < 0) state.monsterHp = 0;
}
