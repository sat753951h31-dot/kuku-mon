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

  let a, b;

  // ▼ 掛け算（今まで通り）
  if (mode === "mul") {
    a = Math.floor(Math.random() * 9) + 1;
    b = Math.floor(Math.random() * 9) + 1;
    return { a, b, answer: a * b, op: "×" };
  }

  // ▼ 足し算・引き算の桁数設定
  let maxA = 9, maxB = 9;

  if (diff === "easy") {
    maxA = 9;   // 1桁
    maxB = 9;   // 1桁
  }

  if (diff === "normal") {
    maxA = 99;  // 2桁
    maxB = 9;   // 1桁
  }

  if (diff === "hard") {
    maxA = 99;  // 2桁
    maxB = 99;  // 2桁
  }

  // ▼ 数字生成
  a = Math.floor(Math.random() * maxA) + 1;
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
