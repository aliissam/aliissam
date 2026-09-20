(function () {
  "use strict";

  const STORAGE_KEY = "ccna-arcade-save-v1";
  const QUESTION_TIME = 20; // seconds
  const START_LIVES = 3;
  const BASE_POINTS = 100;
  const MAX_TIME_BONUS = 50;
  const STREAK_BONUS_PER = 10;
  const STREAK_BONUS_CAP = 100;

  // ---------- Persistent state ----------
  function defaultSave() {
    return {
      unlocked: 1, // number of worlds unlocked (index into LEVELS)
      bestScores: {}, // levelId -> best score
      highScores: [], // [{initials, score}]
    };
  }

  function loadSave() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultSave();
      const parsed = JSON.parse(raw);
      return Object.assign(defaultSave(), parsed);
    } catch (e) {
      return defaultSave();
    }
  }

  function saveGame(save) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
    } catch (e) {
      /* ignore quota / privacy-mode errors */
    }
  }

  let save = loadSave();

  // ---------- Audio (Web Audio API, no external files) ----------
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  }

  function beep(freq, duration, type, gainVal, delay) {
    if (!audioCtx) return;
    const t0 = audioCtx.currentTime + (delay || 0);
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || "square";
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(gainVal || 0.15, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  const sfx = {
    select: () => beep(440, 0.08, "square", 0.1),
    correct: () => {
      beep(660, 0.09, "square", 0.12, 0);
      beep(880, 0.12, "square", 0.12, 0.08);
    },
    wrong: () => {
      beep(180, 0.2, "sawtooth", 0.12, 0);
      beep(120, 0.25, "sawtooth", 0.12, 0.1);
    },
    levelClear: () => {
      [523, 659, 784, 1046].forEach((f, i) => beep(f, 0.15, "square", 0.12, i * 0.12));
    },
    gameOver: () => {
      [400, 340, 280, 200].forEach((f, i) => beep(f, 0.22, "sawtooth", 0.12, i * 0.16));
    },
    victory: () => {
      [523, 659, 784, 1046, 1318].forEach((f, i) => beep(f, 0.18, "square", 0.13, i * 0.14));
    },
  };

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  const screens = {};
  document.querySelectorAll(".screen").forEach((el) => (screens[el.id] = el));

  function showScreen(id) {
    Object.values(screens).forEach((el) => el.classList.remove("active"));
    screens[id].classList.add("active");
  }

  const hud = $("hud");
  const hudLevel = $("hud-level");
  const hudScore = $("hud-score");
  const hudStreak = $("hud-streak");
  const hudLives = $("hud-lives");

  // ---------- Run state ----------
  let run = null; // active game run

  function newRun(levelIndex) {
    return {
      levelIndex,
      qIndex: 0,
      score: 0,
      lives: START_LIVES,
      streak: 0,
      timerId: null,
      timeLeft: QUESTION_TIME,
      answered: false,
    };
  }

  function pad4(n) {
    return String(Math.max(0, Math.floor(n))).padStart(4, "0");
  }

  function updateHud() {
    const level = LEVELS[run.levelIndex];
    hudLevel.textContent = run.levelIndex + 1;
    hudScore.textContent = pad4(run.score);
    hudStreak.textContent = run.streak;
    hudLives.innerHTML = "&#9829;".repeat(run.lives) + "&#9793;".repeat(START_LIVES - run.lives);
  }

  // ---------- World select ----------
  function renderWorldSelect() {
    const grid = $("world-grid");
    grid.innerHTML = "";
    LEVELS.forEach((level, i) => {
      const isLocked = i >= save.unlocked;
      const cleared = save.bestScores[level.id] !== undefined;
      const card = document.createElement("button");
      card.className = "world-card" + (isLocked ? " locked" : "") + (cleared ? " cleared" : "");
      card.disabled = isLocked;
      const best = cleared ? save.bestScores[level.id] : "--";
      card.innerHTML =
        '<span class="world-name">' + level.icon + " " + (i + 1) + ". " + level.name + "</span>" +
        '<span class="world-meta">' + (isLocked ? "LOCKED" : "BEST: " + best + " · " + level.questions.length + " Q") + "</span>";
      if (!isLocked) {
        card.addEventListener("click", () => startLevel(i));
      }
      grid.appendChild(card);
    });
  }

  // ---------- Gameplay ----------
  function startLevel(levelIndex) {
    ensureAudio();
    run = newRun(levelIndex);
    hud.classList.remove("hidden");
    showScreen("screen-game");
    updateHud();
    showQuestion();
  }

  function clearTimer() {
    if (run.timerId) {
      clearInterval(run.timerId);
      run.timerId = null;
    }
  }

  function showQuestion() {
    clearTimer();
    const level = LEVELS[run.levelIndex];
    const q = level.questions[run.qIndex];
    run.answered = false;
    run.timeLeft = QUESTION_TIME;

    $("question-count").textContent = "Q" + (run.qIndex + 1) + " / " + level.questions.length;
    $("boss-banner").classList.toggle("hidden", !q.boss);
    $("question-text").textContent = q.q;
    $("feedback").textContent = "";
    $("explain-text").textContent = "";

    const timerBar = $("timer-bar");
    timerBar.style.width = "100%";
    timerBar.classList.remove("warn");

    const answersEl = $("answers");
    answersEl.innerHTML = "";
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "answer-btn";
      btn.innerHTML = '<span class="k">' + (i + 1) + "</span>" + opt;
      btn.addEventListener("click", () => handleAnswer(i));
      answersEl.appendChild(btn);
    });

    const tickMs = 100;
    let elapsed = 0;
    run.timerId = setInterval(() => {
      elapsed += tickMs / 1000;
      run.timeLeft = Math.max(0, QUESTION_TIME - elapsed);
      const pct = (run.timeLeft / QUESTION_TIME) * 100;
      timerBar.style.width = pct + "%";
      if (pct < 30) timerBar.classList.add("warn");
      if (run.timeLeft <= 0) {
        clearTimer();
        handleAnswer(-1); // timeout
      }
    }, tickMs);
  }

  function handleAnswer(choiceIndex) {
    if (run.answered) return;
    run.answered = true;
    clearTimer();
    sfx.select();

    const level = LEVELS[run.levelIndex];
    const q = level.questions[run.qIndex];
    const buttons = document.querySelectorAll("#answers .answer-btn");
    buttons.forEach((b) => (b.disabled = true));

    const isCorrect = choiceIndex === q.answer;

    if (choiceIndex >= 0 && buttons[choiceIndex]) {
      buttons[choiceIndex].classList.add(isCorrect ? "correct" : "wrong");
    }
    if (!isCorrect && buttons[q.answer]) {
      buttons[q.answer].classList.add("correct");
    }

    if (isCorrect) {
      sfx.correct();
      run.streak += 1;
      const timeBonus = Math.round((run.timeLeft / QUESTION_TIME) * MAX_TIME_BONUS);
      const streakBonus = Math.min(STREAK_BONUS_CAP, (run.streak - 1) * STREAK_BONUS_PER);
      let points = BASE_POINTS + timeBonus + streakBonus;
      if (q.boss) points *= 2;
      run.score += points;
      $("feedback").textContent =
        (choiceIndex === -1 ? "" : "CORRECT! ") + "+" + points + " PTS" + (run.streak > 1 ? "  (STREAK x" + run.streak + ")" : "");
    } else {
      sfx.wrong();
      run.streak = 0;
      run.lives -= 1;
      $("feedback").textContent = choiceIndex === -1 ? "TIME'S UP!" : "WRONG!";
    }

    if (q.explain) $("explain-text").textContent = q.explain;

    updateHud();

    setTimeout(() => {
      if (run.lives <= 0) {
        gameOver();
        return;
      }
      run.qIndex += 1;
      const lvl = LEVELS[run.levelIndex];
      if (run.qIndex >= lvl.questions.length) {
        levelClear();
      } else {
        showQuestion();
      }
    }, 1100);
  }

  function levelClear() {
    clearTimer();
    sfx.levelClear();
    const level = LEVELS[run.levelIndex];
    const prevBest = save.bestScores[level.id] || 0;
    const best = Math.max(prevBest, run.score);
    save.bestScores[level.id] = best;
    save.unlocked = Math.max(save.unlocked, Math.min(LEVELS.length, run.levelIndex + 2));
    saveGame(save);

    $("clear-score").textContent = run.score;
    $("clear-best").textContent = best;

    const isLastLevel = run.levelIndex === LEVELS.length - 1;
    $("btn-next-world").textContent = isLastLevel ? "FINISH" : "CONTINUE";
    $("btn-next-world").onclick = () => {
      if (isLastLevel) {
        victory();
      } else {
        hud.classList.add("hidden");
        showScreen("screen-worldselect");
        renderWorldSelect();
      }
    };
    hud.classList.add("hidden");
    showScreen("screen-levelclear");
  }

  function victory() {
    sfx.victory();
    $("victory-score").textContent = "FINAL SCORE: " + run.score;
    if (isHighScore(run.score)) recordHighScore("WIN", run.score);
    showScreen("screen-victory");
  }

  function gameOver() {
    clearTimer();
    sfx.gameOver();
    hud.classList.add("hidden");
    $("gameover-score").textContent = "SCORE: " + run.score;

    const qualifies = isHighScore(run.score);
    $("gameover-entry").classList.toggle("hidden", !qualifies);
    if (qualifies) {
      const input = $("initials-input");
      input.value = "";
      setTimeout(() => input.focus(), 50);
      $("btn-save-initials").onclick = () => {
        const initials = (input.value || "AAA").toUpperCase().slice(0, 3) || "AAA";
        recordHighScore(initials, run.score);
        $("gameover-entry").classList.add("hidden");
      };
    }

    $("btn-retry").onclick = () => startLevel(run.levelIndex);
    showScreen("screen-gameover");
  }

  // ---------- High scores ----------
  function isHighScore(score) {
    if (score <= 0) return false;
    if (save.highScores.length < 10) return true;
    return score > save.highScores[save.highScores.length - 1].score;
  }

  function recordHighScore(initials, score) {
    save.highScores.push({ initials, score });
    save.highScores.sort((a, b) => b.score - a.score);
    save.highScores = save.highScores.slice(0, 10);
    saveGame(save);
    renderHighScores();
  }

  function renderHighScores() {
    const list = $("highscore-list");
    list.innerHTML = "";
    if (save.highScores.length === 0) {
      list.innerHTML = "<li>NO SCORES YET — GO PLAY!</li>";
      return;
    }
    save.highScores.forEach((entry, i) => {
      const li = document.createElement("li");
      li.innerHTML = "<span>" + (i + 1) + ". " + entry.initials + "</span><span>" + entry.score + "</span>";
      list.appendChild(li);
    });
  }

  // ---------- Study Mode (no timer, no lives, self-paced learning) ----------
  // Two sections per world: "learn" (read-only concept notes) and
  // "practice" (the quiz bank, browsed with reveal-on-demand answers).
  let study = null; // { levelIndex, section: 'learn'|'practice', index, revealed }

  function renderStudyWorldSelect() {
    const grid = $("study-world-grid");
    grid.innerHTML = "";
    LEVELS.forEach((level, i) => {
      const card = document.createElement("button");
      card.className = "world-card";
      card.innerHTML =
        '<span class="world-name">' + level.icon + " " + (i + 1) + ". " + level.name + "</span>" +
        '<span class="world-meta">' + level.lessons.length + " NOTES &middot; " + level.questions.length + " CARDS</span>";
      card.addEventListener("click", () => startStudy(i));
      grid.appendChild(card);
    });
  }

  function startStudy(levelIndex) {
    ensureAudio();
    sfx.select();
    study = { levelIndex, section: "learn", index: 0, revealed: false };
    $("study-world-name").textContent = LEVELS[levelIndex].icon + " " + LEVELS[levelIndex].name;
    showScreen("screen-study");
    setStudySection("learn");
  }

  function setStudySection(section) {
    study.section = section;
    study.index = 0;
    study.revealed = false;
    $("tab-learn").classList.toggle("active", section === "learn");
    $("tab-practice").classList.toggle("active", section === "practice");
    showStudyCard();
  }

  function showStudyCard() {
    if (study.section === "learn") {
      showLearnCard();
    } else {
      showPracticeCard();
    }
  }

  function showLearnCard() {
    const level = LEVELS[study.levelIndex];
    const lesson = level.lessons[study.index];

    $("study-count").textContent = "Note " + (study.index + 1) + " / " + level.lessons.length;
    $("study-boss-banner").classList.add("hidden");
    $("study-question").textContent = lesson.title;
    $("study-lesson-body").textContent = lesson.body;
    $("study-lesson-body").classList.remove("hidden");
    $("study-answers").innerHTML = "";
    $("btn-study-reveal").classList.add("hidden");
    $("study-explain").classList.add("hidden");

    $("btn-study-prev").disabled = study.index === 0;
    const isLast = study.index === level.lessons.length - 1;
    $("btn-study-next").textContent = isLast ? "START PRACTICE →" : "NEXT →";
  }

  function showPracticeCard() {
    const level = LEVELS[study.levelIndex];
    const q = level.questions[study.index];
    study.revealed = false;

    $("study-count").textContent = "Card " + (study.index + 1) + " / " + level.questions.length;
    $("study-boss-banner").classList.toggle("hidden", !q.boss);
    $("study-question").textContent = q.q;
    $("study-lesson-body").classList.add("hidden");
    $("study-explain").textContent = q.explain || "";
    $("study-explain").classList.add("hidden");
    $("btn-study-reveal").classList.remove("hidden");

    const answersEl = $("study-answers");
    answersEl.innerHTML = "";
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "answer-btn";
      btn.disabled = true;
      btn.innerHTML = '<span class="k">' + (i + 1) + "</span>" + opt;
      answersEl.appendChild(btn);
    });

    $("btn-study-prev").disabled = study.index === 0;
    $("btn-study-next").textContent = study.index === level.questions.length - 1 ? "FINISH →" : "NEXT →";
  }

  function revealStudyAnswer() {
    if (study.section !== "practice" || study.revealed) return;
    study.revealed = true;
    sfx.select();
    const level = LEVELS[study.levelIndex];
    const q = level.questions[study.index];
    const buttons = document.querySelectorAll("#study-answers .answer-btn");
    if (buttons[q.answer]) buttons[q.answer].classList.add("correct");
    $("study-explain").classList.remove("hidden");
    $("btn-study-reveal").classList.add("hidden");
  }

  // ---------- Navigation wiring ----------
  $("btn-start").addEventListener("click", () => {
    ensureAudio();
    sfx.select();
    hud.classList.add("hidden");
    showScreen("screen-worldselect");
    renderWorldSelect();
  });

  $("btn-study").addEventListener("click", () => {
    ensureAudio();
    sfx.select();
    hud.classList.add("hidden");
    showScreen("screen-study-worldselect");
    renderStudyWorldSelect();
  });

  $("btn-study-back").addEventListener("click", () => {
    sfx.select();
    showScreen("screen-boot");
  });

  $("btn-study-reveal").addEventListener("click", revealStudyAnswer);

  $("tab-learn").addEventListener("click", () => {
    sfx.select();
    setStudySection("learn");
  });

  $("tab-practice").addEventListener("click", () => {
    sfx.select();
    setStudySection("practice");
  });

  $("btn-study-prev").addEventListener("click", () => {
    if (study.index === 0) return;
    sfx.select();
    study.index -= 1;
    showStudyCard();
  });

  $("btn-study-next").addEventListener("click", () => {
    const level = LEVELS[study.levelIndex];
    const deck = study.section === "learn" ? level.lessons : level.questions;
    sfx.select();
    if (study.index >= deck.length - 1) {
      if (study.section === "learn") {
        setStudySection("practice");
      } else {
        showScreen("screen-study-worldselect");
        renderStudyWorldSelect();
      }
      return;
    }
    study.index += 1;
    showStudyCard();
  });

  $("btn-study-menu").addEventListener("click", () => {
    sfx.select();
    showScreen("screen-study-worldselect");
    renderStudyWorldSelect();
  });

  $("btn-howto").addEventListener("click", () => {
    ensureAudio();
    sfx.select();
    showScreen("screen-howto");
  });

  $("btn-scores").addEventListener("click", () => {
    ensureAudio();
    sfx.select();
    renderHighScores();
    showScreen("screen-highscores");
  });

  document.querySelectorAll(".back-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      sfx.select();
      showScreen("screen-boot");
    })
  );

  $("btn-worldselect-back").addEventListener("click", () => {
    sfx.select();
    showScreen("screen-boot");
  });

  $("btn-clear-menu").addEventListener("click", () => {
    hud.classList.add("hidden");
    showScreen("screen-worldselect");
    renderWorldSelect();
  });

  $("btn-gameover-menu").addEventListener("click", () => {
    showScreen("screen-boot");
  });

  $("btn-victory-menu").addEventListener("click", () => {
    showScreen("screen-boot");
  });

  // Keyboard support: 1-4 to answer during gameplay.
  document.addEventListener("keydown", (e) => {
    if (!screens["screen-game"].classList.contains("active")) return;
    if (["1", "2", "3", "4"].includes(e.key)) {
      const idx = Number(e.key) - 1;
      const buttons = document.querySelectorAll("#answers .answer-btn");
      if (buttons[idx] && !buttons[idx].disabled) handleAnswer(idx);
    }
  });

  // Init
  showScreen("screen-boot");
})();
