// Edit the arrays below to add/update content — this file IS the content,
// no server or build step needed. Just save and refresh the page.
//
// Each array holds plain objects. Delete the example entries and add your
// own in the same shape.

const SITE = {
  name: "Ali Issam",
  tagline: "Books, habits, games, and whatever else I'm into right now.",
};

const BOOKS = [
  // status: "reading" | "finished" | "want-to-read"
  { title: "Atomic Habits", author: "James Clear", status: "finished", note: "Example entry — edit me in data.js" },
  { title: "Project Hail Mary", author: "Andy Weir", status: "reading", note: "" },
];

const FILMS = [
  // type: "movie" | "series", status: "watching" | "want-to-watch" | "finished"
  { title: "Dune: Part Two", type: "movie", status: "finished", note: "Example entry — edit me in data.js" },
  { title: "Severance", type: "series", status: "watching", note: "" },
];

const COURSES = [
  // status: "studying" | "want-to-study" | "done"
  { title: "CS50: Introduction to Computer Science", platform: "edX / Harvard", status: "want-to-study", link: "https://cs50.harvard.edu/x/", note: "Example entry — edit me in data.js" },
];

const GAMES = [
  // status: "playing" | "want-to-play" | "finished"
  { title: "Baldur's Gate 3", platform: "PC", status: "playing", note: "Example entry — edit me in data.js" },
];

const HABITS = [
  // streaks are tracked locally in your browser (localStorage), nothing is sent anywhere
  { name: "Read 20 minutes", note: "Every day, before bed" },
  { name: "Workout", note: "" },
];

const INTERESTS = [
  { title: "Software & systems design", note: "" },
  { title: "Productivity & self-improvement", note: "" },
];
