import * as Logic from './game/logic.js';

//UI関連
let currentQuestion;
let timeLeft = 60;
let timerId = null;
let gameStarted = false;
let difficulty = "normal"; // デフォルトはふつう

// UI 要素取得
const startBtn = document.getElementById("startBtn");
const questionEl = document.getElementById("question");
const answerInput = document.getElementById("answerInput");
const resultEl = document.getElementById("result");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");
const retryBtn = document.getElementById("retryBtn");
const backToTitleBtn = document.getElementById("backToTitleBtn");

// UI に問題を表示
function renderQuestion() {
  const q = document.getElementById("questionText");
  q.textContent = `${currentQuestion.a} × ${currentQuestion.b} は？`;

  q.className = difficulty;

  const bubble = document.getElementById("speechBubble");
  bubble.classList.remove("correctBubble", "wrongBubble", "pop");

  void bubble.offsetWidth; // アニメーション再適用
  bubble.classList.add("pop");
}


// UI にモンスターを表示
function renderStatus() {
  scoreEl.textContent = `モンスターHP: ${Logic.state.monsterHp} / レベル: ${Logic.state.level}`;
  renderHpBar();
}

// UI にタイマー表示
function renderTimer() {
  timerEl.textContent = `残り時間: ${timeLeft}秒`;
}

// UI にHPバーを表示
function renderHpBar() {
  const maxHp = 30 + (Logic.state.level - 1) * 10;
  const percent = (Logic.state.monsterHp / maxHp) * 100;
  const hpBar = document.getElementById("hpBar");
  hpBar.style.width = percent + "%";
}

// ゲーム開始（UI 版）
function startGame() {
  Logic.state.score = 0;
  Logic.state.level = 1;
  Logic.state.correctCount = 0;
  Logic.state.monsterHp = 30;
  Logic.state.defeatedCount = 0;
  Logic.state.defeatedSummary = {}; 

  resultEl.textContent = "";
  answerInput.value = "";

  gameStarted = true;

  updateMonsterImage();
  timeLeft = 60;

  nextQuestion();
  renderQuestion();
  renderStatus();
  renderTimer();

  startTimer();
}

// タイマー更新
function startTimer() {
  timerId = setInterval(() => {
    timeLeft--;
    renderTimer();

    if (timeLeft <= 0) {
      clearInterval(timerId);
      endGame();
    }
  }, 1000);
}

// 次の問題を生成
function nextQuestion() {
  currentQuestion = Logic.generateQuestion();
}

// 回答処理
function submitAnswer() {
  if (!currentQuestion) return;

  const value = answerInput.value;
  if (value === "") return;

  const isCorrect = Logic.checkAnswer(currentQuestion, value);

  if (isCorrect) {
    let damage = 100; // デフォルト（ふつう）debug中は１００にする

    if (difficulty === "easy") damage = 15;
    if (difficulty === "hard") damage = 5;

    Logic.damageMonster(damage);
    resultEl.textContent = "⭕ 正解！";
    resultEl.className = "correct";
    const bubble = document.getElementById("speechBubble");
    bubble.classList.remove("wrongBubble");
    bubble.classList.add("correctBubble");
    
    renderStatus();

    // 敵撃破判定
    if (Logic.state.monsterHp <= 0) {
      defeatMonster();
      if (Logic.state.defeatedCount >= Logic.state.totalMonsters) {
        endGame(true); // ★全モンスター討伐
        return;
      }
      // ここでHPを初期化
      Logic.state.monsterHp = 30 + (Logic.state.level - 1) * 10;

      // HPバーを更新
      renderHpBar();

      // 次のモンスター画像を読み込む
      updateMonsterImage();

      resultEl.textContent = "🎉 敵を倒した！レベルアップ！";
      renderStatus();
    }

  } else {
    resultEl.textContent = `❌ 不正解…（${currentQuestion.a} × ${currentQuestion.b} = ${currentQuestion.answer}）`;
    resultEl.className = "wrong";
    const bubble = document.getElementById("speechBubble");
    bubble.classList.remove("correctBubble");
    bubble.classList.add("wrongBubble");
  }

  nextQuestion();
  renderQuestion();
  answerInput.value = "";
}

function updateMonsterImage() {
  const level = Logic.state.level;
  const img = document.getElementById("monsterImg");

  // 通常・色違い・レアカラーの対応表
  const monsterSets = {
    1: ["/monsters/monster_lv1.png", "/monsters/monster_lv4.png", "/monsters/monster_lv7.png", "/monsters/monster_lv10.png"], // スライム
    2: ["/monsters/monster_lv2.png", "/monsters/monster_lv5.png", "/monsters/monster_lv8.png", "/monsters/monster_lv11.png"], // モンスター
    3: ["/monsters/monster_lv3.png", "/monsters/monster_lv6.png", "/monsters/monster_lv9.png", "/monsters/monster_lv12.png"], // ドラゴン
  };

  // 出現確率設定
  const rand = Math.random();
  let variantIndex = 0; // 0:通常, 1:色違い, 2:黒, 3:虹

  if (rand < 0.15) variantIndex = 1; // 15% 色違い
  else if (rand < 0.18) variantIndex = 2; // 3% 黒レア
  else if (rand < 0.19) variantIndex = 3; // 1% 虹レア

  // レベルサイクル（1〜3）
  const baseLevel = ((level - 1) % 3) + 1;
  const selectedImage = monsterSets[baseLevel][variantIndex];

  img.src = selectedImage;
  
  Logic.state.currentMonsterImage = selectedImage;

  // レア出現時の演出
  if (variantIndex >= 2) {
    showRareEffect(variantIndex);
  }
}

// レア演出関数
function showRareEffect(type) {
  const effect = document.getElementById("rareEffect");
  effect.style.display = "block";
  effect.textContent =
    type === 2 ? "✨レアカラー出現！(黒)" : "🌈超レア！虹色モンスター登場！";
  setTimeout(() => (effect.style.display = "none"), 3000);
}

// 画像ごとにカウント
function defeatMonster() {
  const img = Logic.state.currentMonsterImage;

  if (!Logic.state.defeatedSummary[img]) {
    Logic.state.defeatedSummary[img] = 1;
  } else {
    Logic.state.defeatedSummary[img]++;
  }

  Logic.state.defeatedCount++;
  Logic.state.level++;

}

function showResultScreen() {
  const list = document.getElementById("resultMonsterList");
  list.innerHTML = "";

  Object.entries(Logic.state.defeatedSummary).forEach(([src, count]) => {
    const wrapper = document.createElement("div");
    wrapper.className = "result-item";

    if (src.includes("lv7") || src.includes("lv8") || src.includes("lv9")) {
      wrapper.classList.add("black-rare");
    }
    if (src.includes("lv10") || src.includes("lv11") || src.includes("lv12")) {
      wrapper.classList.add("rainbow-rare");
    }

    const img = document.createElement("img");
    img.src = src;
    img.className = "resultMonsterIcon";

    const label = document.createElement("div");
    label.className = "result-count";
    label.textContent = `×${count}`;

    wrapper.appendChild(img);
    wrapper.appendChild(label);
    list.appendChild(wrapper);
  });
}



// 難易度選択
document.querySelectorAll(".difficulty").forEach(btn => {
  btn.addEventListener("click", () => {
    difficulty = btn.dataset.mode;
    document.querySelectorAll(".difficulty").forEach(b => b.style.backgroundColor = "#fff");
    btn.style.backgroundColor = "#ffb6a1"; // 選択中を強調
  });
});

// スタートボタン
startBtn.addEventListener("click", () => {
  startScreen.style.display = "none";
  gameScreen.style.display = "block";
  startGame();
});

// リトライボタン
retryBtn.addEventListener("click", () => {
  resultScreen.style.display = "none";
  gameScreen.style.display = "block";
  startGame();
});

// 戻るボタン
backToTitleBtn.addEventListener("click", () => {
  resultScreen.style.display = "none";
  startScreen.style.display = "flex";
});

// テンキー入力
document.querySelectorAll(".key").forEach(btn => {
  btn.addEventListener("click", () => {
    const val = btn.textContent;

    if (val === "←") {
      answerInput.value = answerInput.value.slice(0, -1);
      return;
    }

    if (val === "OK") {
      submitAnswer();
      return;
    }

    // 数字入力
    answerInput.value += val;
  });
});

// ゲーム終了
function endGame(isClear = false) {
  clearInterval(timerId);
  timerId = null;

  // ゲーム画面を隠す
  gameScreen.style.display = "none";

  // リザルト画面を表示
  resultScreen.style.display = "flex";

  if (isClear) {
    resultTitle.textContent = "🏆 ゲームクリア！";
    resultDetail.textContent = `全モンスター討伐完了！`;
  } else {
    resultTitle.textContent = "⌛ 時間切れ！";
    resultDetail.textContent = `${Logic.state.defeatedCount}/${Logic.state.totalMonsters} 討伐完了`;
  }
  
  showResultScreen();
}

//初期設定
window.addEventListener("DOMContentLoaded", () => {
  const normalBtn = document.querySelector('[data-mode="normal"]');
  normalBtn.style.backgroundColor = "#ffb6a1"; // 選択中カラー
});