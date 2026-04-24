export const state = {
  level: 1,
  monsterHp: 30,
  defeatedCount: 0,  // ★討伐数
  defeatedSummary: {},
  totalMonsters: 6,  // ★全体数
};

export function generateQuestion() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a * b };
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
