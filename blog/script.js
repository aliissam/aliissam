(function () {
  "use strict";

  // ---------- theme ----------
  const THEME_KEY = "blog-theme";
  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }
  function loadTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function saveTheme(theme) {
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* ignore */ }
  }
  applyTheme(loadTheme());
  document.getElementById("theme-toggle").addEventListener("click", function () {
    const current = document.documentElement.getAttribute("data-theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const effectiveDark = current ? current === "dark" : prefersDark;
    const next = effectiveDark ? "light" : "dark";
    applyTheme(next);
    saveTheme(next);
  });

  // ---------- site header ----------
  if (typeof SITE !== "undefined") {
    if (SITE.name) document.getElementById("site-name").textContent = SITE.name;
    if (SITE.tagline) document.getElementById("site-tagline").textContent = SITE.tagline;
  }

  // ---------- tabs ----------
  const tabButtons = document.querySelectorAll("nav.tabs button");
  tabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      tabButtons.forEach(function (b) { b.classList.remove("active"); });
      document.querySelectorAll("section.panel").forEach(function (p) { p.classList.remove("active"); });
      btn.classList.add("active");
      document.getElementById(btn.dataset.target).classList.add("active");
      try { localStorage.setItem("blog-last-tab", btn.dataset.target); } catch (e) { /* ignore */ }
    });
  });
  (function restoreTab() {
    let last = null;
    try { last = localStorage.getItem("blog-last-tab"); } catch (e) { /* ignore */ }
    const btn = last && document.querySelector('nav.tabs button[data-target="' + last + '"]');
    if (btn) btn.click();
  })();

  // ---------- helpers ----------
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function slug(status) {
    return (status || "").toLowerCase().replace(/\s+/g, "-");
  }
  function hasContent(item, keys) {
    return keys.some(function (k) { return item[k] && String(item[k]).trim().length; });
  }
  function emptyHint(grid, message) {
    grid.appendChild(el("div", "empty-hint", message));
  }

  function renderCardList(gridId, items, build, emptyMessage, titleKey) {
    const grid = document.getElementById(gridId);
    const real = items.filter(function (item) { return item[titleKey] && item[titleKey].trim(); });
    if (!real.length) { emptyHint(grid, emptyMessage); return; }
    real.forEach(function (item) { grid.appendChild(build(item)); });
  }

  function mediaCard(item, titleKey, metaParts, status) {
    const card = el("div", "card");
    card.appendChild(el("h3", null, item[titleKey]));
    const metaText = metaParts.filter(Boolean).join(" · ");
    if (metaText) card.appendChild(el("p", "meta", metaText));
    if (status) card.appendChild(el("span", "tag " + slug(status), status.replace(/-/g, " ")));
    if (item.note) card.appendChild(el("p", "note", item.note));
    if (item.link) {
      const p = el("p", "note");
      const a = el("a", null, "link ↗");
      a.href = item.link;
      a.target = "_blank";
      a.rel = "noopener";
      p.appendChild(a);
      card.appendChild(p);
    }
    return card;
  }

  // ---------- books ----------
  renderCardList("books-grid", BOOKS, function (b) {
    return mediaCard(b, "title", [b.author], b.status);
  }, "No books yet — add some in data.js.", "title");

  // ---------- films ----------
  renderCardList("films-grid", FILMS, function (f) {
    return mediaCard(f, "title", [f.type], f.status);
  }, "Nothing here yet — add movies/series in data.js.", "title");

  // ---------- courses ----------
  renderCardList("courses-grid", COURSES, function (c) {
    return mediaCard(c, "title", [c.platform], c.status);
  }, "No courses yet — add some in data.js.", "title");

  // ---------- games ----------
  renderCardList("games-grid", GAMES, function (g) {
    return mediaCard(g, "title", [g.platform], g.status);
  }, "No games yet — add some in data.js.", "title");

  // ---------- interests ----------
  renderCardList("interests-grid", INTERESTS, function (i) {
    const card = el("div", "card");
    card.appendChild(el("h3", null, i.title));
    if (i.note) card.appendChild(el("p", "note", i.note));
    return card;
  }, "No interests listed yet — add some in data.js.", "title");

  // ---------- habits ----------
  const HABIT_KEY = "blog-habit-streaks";
  function loadStreaks() {
    try { return JSON.parse(localStorage.getItem(HABIT_KEY) || "{}"); } catch (e) { return {}; }
  }
  function saveStreaks(data) {
    try { localStorage.setItem(HABIT_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }
  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  (function renderHabits() {
    const grid = document.getElementById("habits-grid");
    const real = HABITS.filter(function (h) { return h.name && h.name.trim(); });
    if (!real.length) { emptyHint(grid, "No habits yet — add some in data.js."); return; }

    const streaks = loadStreaks();

    real.forEach(function (habit) {
      const state = streaks[habit.name] || { streak: 0, lastDate: null };
      const card = el("div", "card habit-card");

      const info = el("div", "habit-info");
      info.appendChild(el("h3", null, habit.name));
      if (habit.note) info.appendChild(el("p", "note", habit.note));
      card.appendChild(info);

      const actions = el("div", "habit-actions");
      const streakLabel = el("span", "streak");
      const strong = el("strong", null, String(state.streak));
      streakLabel.appendChild(strong);
      streakLabel.appendChild(document.createTextNode(" day" + (state.streak === 1 ? "" : "s")));
      actions.appendChild(streakLabel);

      const checkBtn = el("button", "check-btn", "✓");
      checkBtn.type = "button";
      const today = todayStr();
      if (state.lastDate === today) checkBtn.classList.add("done");

      checkBtn.addEventListener("click", function () {
        const current = streaks[habit.name] || { streak: 0, lastDate: null };
        if (current.lastDate === today) {
          current.streak = Math.max(0, current.streak - 1);
          current.lastDate = null;
          checkBtn.classList.remove("done");
        } else {
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
          current.streak = current.lastDate === yesterday ? current.streak + 1 : 1;
          current.lastDate = today;
          checkBtn.classList.add("done");
        }
        streaks[habit.name] = current;
        saveStreaks(streaks);
        strong.textContent = String(current.streak);
      });

      actions.appendChild(checkBtn);
      card.appendChild(actions);
      grid.appendChild(card);
    });
  })();

  // ---------- home summary ----------
  (function renderHome() {
    const grid = document.getElementById("home-summary");
    const counts = [
      { label: "Books", list: BOOKS, key: "title" },
      { label: "Films & Series", list: FILMS, key: "title" },
      { label: "Courses", list: COURSES, key: "title" },
      { label: "Games", list: GAMES, key: "title" },
      { label: "Habits tracked", list: HABITS, key: "name" },
      { label: "Interests", list: INTERESTS, key: "title" },
    ];
    counts.forEach(function (c) {
      const n = c.list.filter(function (item) { return item[c.key] && item[c.key].trim(); }).length;
      const card = el("div", "card");
      card.appendChild(el("h3", null, String(n)));
      card.appendChild(el("p", "meta", c.label));
      grid.appendChild(card);
    });
  })();
})();
