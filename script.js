/* =========================================================
   CERDAS! — logika permainan kuis pengetahuan umum
   =========================================================
   Struktur data satu soal:
   {
     category: string,
     question: string,
     options: [string, string, string, string],
     answer: number   // index jawaban benar di dalam options
   }
========================================================= */

const QUESTION_BANK = [
  { category: "Geografi", question: "Gunung tertinggi di dunia adalah...", options: ["Kilimanjaro", "Everest", "Fuji", "Rinjani"], answer: 1 },
  { category: "Sains", question: "Planet yang dikenal sebagai 'Planet Merah' adalah...", options: ["Venus", "Jupiter", "Mars", "Saturnus"], answer: 2 },
  { category: "Sejarah", question: "Proklamasi Kemerdekaan Indonesia dibacakan pada tanggal...", options: ["17 Agustus 1945", "1 Juni 1945", "28 Oktober 1928", "10 November 1945"], answer: 0 },
  { category: "Geografi", question: "Ibu kota Australia adalah...", options: ["Sydney", "Melbourne", "Canberra", "Perth"], answer: 2 },
  { category: "Sains", question: "Gas yang paling banyak menyusun atmosfer Bumi adalah...", options: ["Oksigen", "Karbon dioksida", "Nitrogen", "Hidrogen"], answer: 2 },
  { category: "Seni & Budaya", question: "Alat musik tradisional asal Jawa Barat yang terbuat dari bambu adalah...", options: ["Angklung", "Kolintang", "Sasando", "Gamelan"], answer: 0 },
  { category: "Olahraga", question: "Dalam sepak bola, jumlah pemain inti satu tim di lapangan adalah...", options: ["9", "10", "11", "12"], answer: 2 },
  { category: "Sains", question: "Organ tubuh manusia yang berfungsi memompa darah adalah...", options: ["Paru-paru", "Hati", "Jantung", "Ginjal"], answer: 2 },
  { category: "Geografi", question: "Sungai terpanjang di dunia adalah...", options: ["Amazon", "Nil", "Yangtze", "Mississippi"], answer: 1 },
  { category: "Sejarah", question: "Candi Borobudur terletak di provinsi...", options: ["Jawa Barat", "Jawa Timur", "Jawa Tengah", "Yogyakarta"], answer: 2 },
  { category: "Bahasa", question: "Kata 'bibliofil' merujuk pada seseorang yang gemar...", options: ["Bepergian", "Membaca buku", "Memasak", "Berkebun"], answer: 1 },
  { category: "Sains", question: "Satuan dasar untuk mengukur arus listrik adalah...", options: ["Volt", "Watt", "Ohm", "Ampere"], answer: 3 },
  { category: "Geografi", question: "Negara dengan populasi terbanyak di dunia saat ini adalah...", options: ["Tiongkok", "Amerika Serikat", "India", "Indonesia"], answer: 2 },
  { category: "Olahraga", question: "Olimpiade musim panas terakhir sebelum 2024 diselenggarakan di kota...", options: ["Rio de Janeiro", "Tokyo", "London", "Beijing"], answer: 1 },
  { category: "Seni & Budaya", question: "Lukisan 'Mona Lisa' adalah karya dari pelukis...", options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"], answer: 2 },
  { category: "Sains", question: "Proses tumbuhan mengubah cahaya matahari menjadi energi disebut...", options: ["Respirasi", "Fotosintesis", "Transpirasi", "Fermentasi"], answer: 1 },
  { category: "Sejarah", question: "Perang Dunia II berakhir pada tahun...", options: ["1943", "1944", "1945", "1946"], answer: 2 },
  { category: "Geografi", question: "Selat yang memisahkan Pulau Sumatra dan Pulau Jawa adalah...", options: ["Selat Malaka", "Selat Sunda", "Selat Bali", "Selat Karimata"], answer: 1 },
  { category: "Bahasa", question: "Lawan kata dari 'antagonis' dalam sebuah cerita adalah...", options: ["Protagonis", "Narator", "Figuran", "Deuteragonis"], answer: 0 },
  { category: "Sains", question: "Elemen kimia dengan simbol 'Au' adalah...", options: ["Perak", "Aluminium", "Emas", "Argon"], answer: 2 },
];

const TIME_PER_QUESTION = 15; // detik
const TOTAL_QUESTIONS = 15;   // jumlah soal per sesi (diacak dari bank)
const BASE_POINTS = 100;
const STORAGE_KEY = "cerdas-best-score";

/* ---------------------- state ---------------------- */

let sessionQuestions = [];
let currentIndex = 0;
let score = 0;
let lives = 3;
let streak = 0;
let bestStreak = 0;
let correctCount = 0;
let timeLeft = TIME_PER_QUESTION;
let timerId = null;
let answerLocked = false;

/* ---------------------- elemen DOM ---------------------- */

const screens = {
  start: document.getElementById("screen-start"),
  game: document.getElementById("screen-game"),
  end: document.getElementById("screen-end"),
};

const el = {
  bestScoreValue: document.getElementById("best-score-value"),
  btnStart: document.getElementById("btn-start"),
  btnRestart: document.getElementById("btn-restart"),

  qIndex: document.getElementById("q-index"),
  qTotal: document.getElementById("q-total"),
  scoreValue: document.getElementById("score-value"),
  livesValue: document.getElementById("lives-value"),
  streakBar: document.getElementById("streak-bar"),
  timerFill: document.getElementById("timer-fill"),

  categoryBadge: document.getElementById("category-badge"),
  questionText: document.getElementById("question-text"),
  answersGrid: document.getElementById("answers-grid"),
  feedbackText: document.getElementById("feedback-text"),

  endEyebrow: document.getElementById("end-eyebrow"),
  endTitle: document.getElementById("end-title"),
  endScore: document.getElementById("end-score"),
  endCorrect: document.getElementById("end-correct"),
  endStreak: document.getElementById("end-streak"),
  endVerdict: document.getElementById("end-verdict"),
};

const LETTERS = ["A", "B", "C", "D"];

/* ---------------------- util ---------------------- */

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove("screen--active"));
  screens[name].classList.add("screen--active");
}

function getBestScore() {
  return Number(localStorage.getItem(STORAGE_KEY) || 0);
}

function setBestScore(value) {
  localStorage.setItem(STORAGE_KEY, String(value));
}

function formatScore(value) {
  return String(value).padStart(4, "0");
}

/* ---------------------- alur permainan ---------------------- */

function startGame() {
  sessionQuestions = shuffle(QUESTION_BANK).slice(0, TOTAL_QUESTIONS);
  currentIndex = 0;
  score = 0;
  lives = 3;
  streak = 0;
  bestStreak = 0;
  correctCount = 0;

  el.qTotal.textContent = sessionQuestions.length;
  updateScoreDisplay();
  updateLivesDisplay();
  el.streakBar.classList.remove("streak-bar--show");

  showScreen("game");
  loadQuestion();
}

function loadQuestion() {
  if (currentIndex >= sessionQuestions.length || lives <= 0) {
    endGame();
    return;
  }

  answerLocked = false;
  const q = sessionQuestions[currentIndex];

  el.qIndex.textContent = currentIndex + 1;
  el.categoryBadge.textContent = q.category;
  el.questionText.textContent = q.question;
  el.feedbackText.textContent = "";

  // acak urutan opsi jawaban, tapi tetap ingat mana yang benar
  const order = shuffle(q.options.map((_, i) => i));
  el.answersGrid.innerHTML = "";
  order.forEach((originalIndex, slot) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.type = "button";
    btn.dataset.letter = LETTERS[slot];
    btn.textContent = q.options[originalIndex];
    btn.addEventListener("click", () => handleAnswer(originalIndex === q.answer, btn));
    el.answersGrid.appendChild(btn);
  });

  startTimer();
}

function startTimer() {
  clearInterval(timerId);
  timeLeft = TIME_PER_QUESTION;
  el.timerFill.style.width = "100%";
  el.timerFill.classList.remove("timer-fill--warn");

  timerId = setInterval(() => {
    timeLeft -= 1;
    const pct = (timeLeft / TIME_PER_QUESTION) * 100;
    el.timerFill.style.width = `${Math.max(pct, 0)}%`;
    if (timeLeft <= 5) el.timerFill.classList.add("timer-fill--warn");

    if (timeLeft <= 0) {
      clearInterval(timerId);
      if (!answerLocked) handleAnswer(false, null); // waktu habis = salah
    }
  }, 1000);
}

function handleAnswer(isCorrect, clickedBtn) {
  if (answerLocked) return;
  answerLocked = true;
  clearInterval(timerId);

  const buttons = [...el.answersGrid.querySelectorAll(".answer-btn")];
  buttons.forEach((b) => (b.disabled = true));

  const q = sessionQuestions[currentIndex];
  const correctBtn = buttons.find((b) => b.textContent === q.options[q.answer]);
  if (correctBtn) correctBtn.classList.add("is-correct");

  if (isCorrect) {
    streak += 1;
    bestStreak = Math.max(bestStreak, streak);
    correctCount += 1;

    const speedBonus = Math.round((timeLeft / TIME_PER_QUESTION) * 50);
    const streakMultiplier = 1 + Math.min(streak - 1, 4) * 0.25; // maks 2x pada streak 5+
    const gained = Math.round((BASE_POINTS + speedBonus) * streakMultiplier);
    score += gained;

    el.feedbackText.textContent = `Benar! +${gained} poin`;
    showStreak();
  } else {
    if (clickedBtn) clickedBtn.classList.add("is-wrong");
    streak = 0;
    lives -= 1;
    el.feedbackText.textContent =
      timeLeft <= 0 ? "Waktu habis!" : "Kurang tepat.";
    el.streakBar.classList.remove("streak-bar--show");
  }

  updateScoreDisplay();
  updateLivesDisplay();

  setTimeout(() => {
    currentIndex += 1;
    loadQuestion();
  }, 1300);
}

function showStreak() {
  if (streak >= 2) {
    el.streakBar.textContent = `🔥 RENTETAN ${streak} BENAR BERTURUT-TURUT`;
    el.streakBar.classList.add("streak-bar--show");
  } else {
    el.streakBar.classList.remove("streak-bar--show");
  }
}

function updateScoreDisplay() {
  el.scoreValue.textContent = formatScore(score);
}

function updateLivesDisplay() {
  el.livesValue.textContent = "♥ ".repeat(Math.max(lives, 0)).trim() || "—";
}

function endGame() {
  clearInterval(timerId);

  const best = getBestScore();
  const isNewBest = score > best;
  if (isNewBest) setBestScore(score);

  el.endEyebrow.textContent = lives <= 0 ? "— NYAWA HABIS —" : "— PERMAINAN SELESAI —";
  el.endTitle.textContent = isNewBest ? "REKOR BARU!" : "SEKIAN!";
  el.endScore.textContent = formatScore(score);
  el.endCorrect.textContent = `${correctCount}/${sessionQuestions.length}`;
  el.endStreak.textContent = bestStreak;
  el.endVerdict.textContent = getVerdict();

  showScreen("end");
}

function getVerdict() {
  const ratio = correctCount / sessionQuestions.length;
  if (ratio >= 0.9) return "Luar biasa — wawasanmu benar-benar juara papan skor!";
  if (ratio >= 0.7) return "Bagus sekali! Tinggal sedikit lagi menuju sempurna.";
  if (ratio >= 0.5) return "Lumayan! Masih ada ruang untuk mengasah pengetahuan umummu.";
  return "Jangan menyerah — coba lagi dan kejar rekormu sendiri.";
}

/* ---------------------- init ---------------------- */

el.bestScoreValue.textContent = formatScore(getBestScore());
el.btnStart.addEventListener("click", startGame);
el.btnRestart.addEventListener("click", startGame);
