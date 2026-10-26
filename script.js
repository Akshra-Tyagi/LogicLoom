/*
  LogicLoom — vanilla JavaScript edition
  --------------------------------------
  This file uses only browser features: DOM templates, events, localStorage,
  Date, and HTML drag-and-drop. There are no imports or framework dependencies.
*/
"use strict";

const STUDENT = "Akshra Tyagi";
const KEYS = {
  tasks: "studyflow.assignments.v1",
  subjects: "studyflow.subjects.v1",
  theme: "studyflow.theme.v1",
  reminders: "studyflow.reminders.v1",
  plans: "studyflow.test-plans.v1",
  practical: "studyflow.practical-files.v1",
};
const statusColumns = [
  { id: "todo", label: "To Do", color: "todo" },
  { id: "progress", label: "In Progress", color: "progress" },
  { id: "completed", label: "Completed", color: "completed" },
];
const subjectColors = [
  { color: "violet", tint: "#eeeaff" },
  { color: "blue", tint: "#e8f0ff" },
  { color: "green", tint: "#e5f4eb" },
  { color: "orange", tint: "#fff0e3" },
  { color: "rose", tint: "#ffeaec" },
];
const seedSubjects = [
  { id: "discrete", title: "Discrete maths", code: "MAT 210", instructor: "Dr. Mira Shah", progress: 58, color: "violet", tint: "#eeeaff", icon: "∴", next: "Problem session · Hall B" },
  { id: "oop", title: "Object oriented programming (C++)", code: "CSC 201", instructor: "Prof. Daniel Lee", progress: 67, color: "blue", tint: "#e8f0ff", icon: "{}", next: "Workshop · Computer Lab 2" },
  { id: "structures", title: "Data structures", code: "CSE 205", instructor: "Dr. Kavya Rao", progress: 73, color: "green", tint: "#e5f4eb", icon: "↗", next: "Lab session · Lab 04" },
  { id: "digital", title: "Digital logic and compiler design", code: "CSC 220", instructor: "Prof. A. Menon", progress: 49, color: "orange", tint: "#fff0e3", icon: "⌘", next: "Lecture · Room 112" },
  { id: "methods", title: "Computational methods", code: "MTH 230", instructor: "Dr. N. Iyer", progress: 62, color: "rose", tint: "#ffeaec", icon: "∑", next: "Tutorial · Hall C" },
];
const legacySubjectNames = {
  "Modern Literature": "Discrete maths",
  "Applied Mathematics": "Computational methods",
  "Biology II": "Data structures",
  "Visual Communication": "Object oriented programming (C++)",
  "World History": "Digital logic and compiler design",
};
const seedTasks = [
  { id: "a1", title: "Set theory worksheet", course: "Discrete maths", dueDate: dateOffset(2), priority: "High", status: "todo" },
  { id: "a2", title: "C++ class design exercise", course: "Object oriented programming (C++)", dueDate: dateOffset(1), priority: "High", status: "todo" },
  { id: "a3", title: "Linked list lab", course: "Data structures", dueDate: dateOffset(5), priority: "Medium", status: "todo" },
  { id: "a4", title: "Logic gates practical", course: "Digital logic and compiler design", dueDate: dateOffset(7), priority: "Low", status: "todo" },
  { id: "a5", title: "Numerical methods problem set", course: "Computational methods", dueDate: dateOffset(3), priority: "Medium", status: "progress" },
  { id: "a6", title: "Operator overloading practice", course: "Object oriented programming (C++)", dueDate: dateOffset(4), priority: "Low", status: "progress" },
  { id: "a7", title: "Proofs & relations review", course: "Discrete maths", dueDate: dateOffset(-1), priority: "Medium", status: "completed" },
  { id: "a8", title: "Graph traversal notes", course: "Data structures", dueDate: dateOffset(-2), priority: "Low", status: "completed" },
];
const navItems = [
  ["dashboard", "Dashboard", "▦"],
  ["courses", "Courses", "▤"],
  ["assignments", "Assignments", "✓"],
  ["tests", "Tests", "◉"],
  ["practical", "Practical file", "▧"],
  ["timetable", "Timetable", "▦"],
];
const quoteList = [
  "Every idea begins as a thread. Keep going and watch what you weave.",
  "A gentle pace still carries you forward.",
  "You don't have to bloom all at once. A small step is still growth.",
  "There is something lovely about beginning again with what you know now.",
  "Let today be made of little things done with care.",
  "Your curiosity is a quiet kind of courage.",
  "One page, one question, one breath—small things make a bright path.",
  "Rest belongs in the rhythm of becoming.",
  "You are allowed to learn your way into confidence.",
  "Even the tiniest spark can light the next idea.",
  "Progress isn't a straight line; sometimes it is a kinder way to try again.",
  "What you are learning is becoming part of who you are.",
];

const state = {
  view: "dashboard",
  dashboardTab: "overview",
  tasks: loadJSON(KEYS.tasks, seedTasks).map((task) => ({ ...task, course: legacySubjectNames[task.course] || task.course })),
  subjects: loadSubjects(),
  theme: localStorage.getItem(KEYS.theme) === "dark" ? "dark" : "light",
  filter: "All",
  search: "",
  searchOpen: false,
  noticeRead: false,
  selectedCourse: null,
  draggedId: null,
  dialog: null,
  profileOpen: false,
  notificationOpen: false,
  mobileOpen: false,
  calendarOpen: false,
  calendarMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  selectedDate: dateKey(new Date()),
  reminders: loadJSON(KEYS.reminders, []),
  savedPlans: loadJSON(KEYS.plans, []),
  practical: loadJSON(KEYS.practical, {}),
  weekOffset: 0,
  selectedWeekday: (new Date().getDay() + 6) % 7,
  toast: null,
  timerRemaining: { meditation: 180, stretch: 300, outdoors: 900 },
  timerRunning: {},
};
const timerIntervals = {};
const app = document.getElementById("app");

function loadJSON(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}
function loadSubjects() {
  const subjects = loadJSON(KEYS.subjects, null);
  if (!subjects) return seedSubjects;
  if (subjects.some((item) => Object.hasOwn(legacySubjectNames, item.title))) {
    const extras = subjects.filter((item) => !Object.hasOwn(legacySubjectNames, item.title) && !seedSubjects.some((seed) => seed.title === item.title));
    return [...seedSubjects, ...extras];
  }
  return subjects;
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { showToast("Browser storage is full. Some changes may not be saved."); }
}
function dateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return dateKey(date);
}
function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}
function todayLabel() {
  return new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
}
function prettyDate(value, options = { month: "short", day: "numeric" }) {
  return new Intl.DateTimeFormat("en", options).format(new Date(`${value}T00:00:00`));
}
function relativeDate(value) {
  if (value === dateKey(new Date())) return "Today";
  if (value === dateOffset(1)) return "Tomorrow";
  return prettyDate(value);
}
function statusLabel(id) {
  return statusColumns.find((column) => column.id === id)?.label || "To Do";
}
function icon(name) {
  const paths = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    moon: '<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
    close: '<path d="m18 6-12 12M6 6l12 12"/>',
    arrow: '<path d="M5 12h14m-7-7 7 7-7 7"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    spark: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm7 12 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/>',
    edit: '<path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15v5Z"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    heart: '<path d="M20.8 8.6c0 5.1-8.8 10.4-8.8 10.4S3.2 13.7 3.2 8.6A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.4Z"/>',
  };
  return `<svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
}
function navIcon(id) {
  return ({ dashboard: "▦", courses: "▤", assignments: "✓", tests: "◉", practical: "▧", timetable: "▦" })[id] || "•";
}
function statusCounts() {
  return {
    done: state.tasks.filter((task) => task.status === "completed").length,
    open: state.tasks.filter((task) => task.status !== "completed").length,
    due: state.tasks.filter((task) => task.status !== "completed" && task.dueDate <= dateOffset(3)).length,
  };
}
function updateStorage() {
  save(KEYS.tasks, state.tasks);
  save(KEYS.subjects, state.subjects);
  save(KEYS.theme, state.theme);
  save(KEYS.reminders, state.reminders);
  save(KEYS.plans, state.savedPlans);
  save(KEYS.practical, state.practical);
}
function pageName() {
  if (state.selectedCourse && state.view === "courses") return state.selectedCourse.title;
  return ({ dashboard: `Good morning, ${STUDENT}.`, courses: "Your subjects", assignments: "Assignment board", timetable: "Your timetable", tests: "Tests & check-ins", practical: "Practical file", "me-time": "Me Time ❤️" })[state.view] || "Dashboard";
}
function pageSubtitle() {
  if (state.selectedCourse && state.view === "courses") return `${state.selectedCourse.code} · ${state.selectedCourse.instructor}`;
  return ({ dashboard: "A little progress today goes a long way.", courses: "Your semester, thoughtfully organized.", assignments: "Your next small win is right here.", timetable: "Make room for the things that move you forward.", tests: "A clear view of what’s coming, one step at a time.", practical: "Keep hands-on work and lab notes together.", "me-time": "Take a little time for yourself—you deserve it." })[state.view] || "";
}
function header() {
  const counts = statusCounts();
  const profileMenu = state.profileOpen ? `<div class="popover profile-popover"><div class="profile-popover-head"><span class="avatar">AT</span><div><strong>${STUDENT}</strong><span>akshra.tyagi@campus.edu</span></div></div><div class="profile-school">♧ Northbridge University</div><button class="popover-footer" data-view="courses">View your subjects ${icon("arrow")}</button></div>` : "";
  const noticeMenu = state.notificationOpen ? `<div class="popover notification-popover"><div class="popover-heading"><strong>Notifications</strong><span>${state.noticeRead ? "All caught up" : "1 new"}</span></div>${state.noticeRead ? '<div class="notification-read">✓ You’re all caught up.</div>' : `<div class="notification-item"><span class="notification-icon">${icon("calendar")}</span><span><strong>Assignment coming up</strong><small>${escapeHTML((state.tasks.find((task) => task.status !== "completed") || seedTasks[0]).title)} is due soon.</small><i>Just now</i></span></div>`}<button class="popover-footer" data-action="mark-read">${state.noticeRead ? "You’re all caught up" : "Mark all as read"} ${icon("check")}</button></div>` : "";
  const matches = searchMatches();
  const searchResults = state.searchOpen && state.search.trim() ? `<div class="search-results"><span class="eyebrow">MATCHING ASSIGNMENTS</span>${matches.tasks.slice(0, 4).map((task) => `<button class="search-result" data-view="assignments"><span class="result-icon">✓</span><span><strong>${escapeHTML(task.title)}</strong><small>${escapeHTML(task.course)}</small></span>${icon("right")}</button>`).join("") || '<p class="search-empty">No assignment matches yet.</p>'}<span class="eyebrow">MATCHING SUBJECTS</span>${matches.subjects.slice(0, 3).map((subject) => `<button class="search-result" data-open-subject="${escapeHTML(subject.id)}"><span class="result-icon">▤</span><span><strong>${escapeHTML(subject.title)}</strong><small>${escapeHTML(subject.code)}</small></span>${icon("right")}</button>`).join("") || '<p class="search-empty">No subject matches yet.</p>'}</div>` : "";
  return `<div class="topbar-left"><button class="icon-button mobile-menu-button" aria-label="Open navigation" data-action="mobile-menu">☰</button><div class="breadcrumb"><span>My workspace</span>${icon("right")}<strong>${escapeHTML(state.view === "me-time" ? "Me Time" : state.selectedCourse ? "Courses" : navItems.find((item) => item[0] === state.view)?.[1] || "Dashboard")}</strong></div></div>
    <div class="topbar-actions"><div class="search-wrap">${icon("search")}<input id="site-search" type="search" value="${escapeHTML(state.search)}" autocomplete="off" aria-label="Search subjects and assignments" placeholder="Search anything..."><button class="search-clear ${state.search ? "visible" : ""}" data-action="clear-search" aria-label="Clear search">×</button>${searchResults}</div><span class="topbar-divider"></span><button class="icon-button theme-toggle" aria-label="Switch to ${state.theme === "light" ? "dark" : "light"} mode" data-action="toggle-theme">${icon(state.theme === "light" ? "moon" : "sun")}</button><div class="popover-anchor"><button class="icon-button notification-button ${state.notificationOpen ? "pressed" : ""}" aria-label="Notifications" data-action="toggle-notifications">${icon("bell")}${!state.noticeRead ? "<i></i>" : ""}</button>${noticeMenu}</div><div class="popover-anchor"><button class="profile-button" data-action="toggle-profile"><span class="avatar avatar-small">AT</span><span class="profile-copy"><strong>${STUDENT}</strong><small>Student</small></span><span>⌄</span></button>${profileMenu}</div></div>`;
}
function sidebar() {
  const counts = statusCounts();
  return `<div class="brand-row"><img class="brand-mark-image" src="studyflow-mark.png" alt=""><div class="brand-text"><strong>LogicLoom</strong><span>STUDENT SPACE</span></div><button class="icon-button mobile-close" aria-label="Close navigation" data-action="mobile-menu">×</button></div><div class="workspace-label">YOUR WORKSPACE</div><nav class="main-nav" aria-label="Study navigation">${navItems.map(([id, label]) => `<button class="nav-item ${state.view === id ? "active" : ""}" data-view="${id}"><span class="nav-glyph">${navIcon(id)}</span><span>${label}</span>${id === "assignments" ? `<span class="nav-count">${counts.open}</span>` : ""}</button>`).join("")}</nav><div class="workspace-label recreation-label">RECHARGE</div><button class="nav-item recreation-nav ${state.view === "me-time" ? "active" : ""}" data-view="me-time"><span class="nav-glyph heart-glyph">${icon("heart")}</span><span>Me Time <span class="heart-emoji">❤️</span></span></button><div class="sidebar-spacer"></div><div class="sidebar-tip"><span class="tip-icon">✳</span><strong>Little steps, big things.</strong><p>You’re showing up for yourself. Keep going.</p><span class="tip-decor">✳</span></div><div class="sidebar-bottom"><button class="help-link" data-view="me-time">ⓘ Help &amp; support</button><div class="student-mini"><span class="avatar avatar-small">AT</span><div><strong>${STUDENT}</strong><span>Undergraduate</span></div><button class="icon-button" aria-label="Open profile options" data-action="toggle-profile">···</button></div></div>`;
}
function searchMatches() {
  const query = state.search.trim().toLowerCase();
  if (!query) return { tasks: [], subjects: [] };
  return {
    tasks: state.tasks.filter((task) => `${task.title} ${task.course} ${task.priority}`.toLowerCase().includes(query)),
    subjects: state.subjects.filter((subject) => `${subject.title} ${subject.code} ${subject.instructor}`.toLowerCase().includes(query)),
  };
}
function thoughtCard() {
  const today = new Date();
  const index = Math.floor(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 86400000) % quoteList.length;
  return `<section class="thought-of-day panel"><span class="thought-quote-icon">“</span><div class="thought-copy"><span class="thought-kicker">✦ THOUGHT OF THE DAY</span><blockquote>${quoteList[index]}</blockquote><cite><span></span>A little note from LogicLoom</cite></div><span class="thought-flourish">♡<i></i><b>✳</b></span></section>`;
}
function metric(label, value, note, glyph, tone) {
  return `<article class="metric-card"><span class="metric-icon ${tone}">${glyph}</span><div class="metric-copy"><div class="metric-top"><span>${label}</span><span>↗</span></div><strong>${value}</strong><small>${note}</small></div></article>`;
}
function taskCard(task) {
  const index = statusColumns.findIndex((column) => column.id === task.status);
  const overdue = task.status !== "completed" && task.dueDate < dateKey(new Date());
  return `<article class="task-card ${task.status === "completed" ? "is-complete" : ""}" draggable="true" data-task-id="${escapeHTML(task.id)}"><div class="task-topline"><span class="priority-badge ${task.priority.toLowerCase()}"><i></i>${task.priority}</span><span class="task-more">···</span></div><h4>${escapeHTML(task.title)}</h4><div class="task-course"><span class="course-dot"></span>${escapeHTML(task.course)}</div><div class="task-footer"><span class="due-date ${overdue ? "overdue" : ""}">${icon("calendar")}${task.status === "completed" ? "Finished" : `Due ${relativeDate(task.dueDate)}`}</span><span class="task-move-controls">${index > 0 ? `<button class="move-button" aria-label="Move ${escapeHTML(task.title)} to ${statusColumns[index - 1].label}" data-action="move-task" data-id="${escapeHTML(task.id)}" data-status="${statusColumns[index - 1].id}">←</button>` : ""}${index < 2 ? `<button class="move-button move-next" aria-label="Move ${escapeHTML(task.title)} to ${statusColumns[index + 1].label}" data-action="move-task" data-id="${escapeHTML(task.id)}" data-status="${statusColumns[index + 1].id}">→</button>` : ""}</span></div></article>`;
}
function taskBoard() {
  const filtered = state.tasks.filter((task) => state.filter === "All" || task.priority === state.filter);
  return `<section class="board-panel panel"><div class="section-heading board-heading"><div><span class="eyebrow">MAKE YOUR NEXT MOVE</span><h2>Assignment board</h2><p>A little progress adds up. Drag a card or use the arrows to move it.</p></div><div class="board-actions"><label class="filter-control">☷ <select id="priority-filter" aria-label="Filter by priority"><option ${state.filter === "All" ? "selected" : ""}>All</option><option ${state.filter === "High" ? "selected" : ""}>High</option><option ${state.filter === "Medium" ? "selected" : ""}>Medium</option><option ${state.filter === "Low" ? "selected" : ""}>Low</option></select><span>⌄</span></label><button class="primary-button add-button" data-action="add-task">＋ Add task</button></div></div><div class="board-columns">${statusColumns.map((column) => {
    const items = filtered.filter((task) => task.status === column.id);
    return `<section class="board-column ${column.color}" data-status="${column.id}"><div class="column-title-row"><span class="column-indicator"></span><h3>${column.label}</h3><span class="column-count">${items.length}</span></div><div class="task-list">${items.map(taskCard).join("")}${!items.length ? `<div class="empty-column">${state.filter === "All" ? "Nothing here yet — enjoy the breathing room." : `No ${state.filter.toLowerCase()} priority tasks here.`}</div>` : ""}</div>${column.id === "todo" ? '<button class="add-task-link" data-action="add-task">＋ Add a task</button>' : ""}${column.id === "completed" && items.length ? '<div class="completion-note">✓ Nice work getting these done.</div>' : ""}</section>`;
  }).join("")}</div>${!state.subjects.length ? '<p class="no-subject-note">No subjects yet. Add one in Courses or create an assignment under Independent study.</p>' : ""}</section>`;
}
function goalCard(done, total) {
  const percent = total ? Math.min(100, Math.round(done / total * 100)) : 0;
  return `<section class="goal-card"><div class="goal-top"><span class="goal-icon">ϟ</span><span class="goal-week">YOUR WEEK</span></div><span class="eyebrow">YOUR WEEKLY GOAL</span><h3>Keep your<br>momentum.</h3><p>You’re building the kind of rhythm that makes finals feel easy.</p><div class="goal-progress-label"><span>Tasks completed</span><strong>${done}<i> / ${total}</i></strong></div><div class="goal-track"><span style="width:${percent}%"></span></div><div class="goal-bottom"><span>Nice steady progress</span><span>${percent}%</span></div></section>`;
}
function timetable(compact = false) {
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + state.weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, i) => { const day = new Date(monday); day.setDate(day.getDate() + i); return day; });
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const times = [
    { day: 0, time: "09:00", duration: "50 min", place: "Hall B · 204" }, { day: 1, time: "10:00", duration: "2 hours", place: "Computer Lab · 2" }, { day: 2, time: "09:00", duration: "50 min", place: "Lab · 04" }, { day: 3, time: "10:00", duration: "50 min", place: "Room · 112" }, { day: 4, time: "11:00", duration: "1 hour", place: "Hall C · 106" }, { day: 0, time: "13:00", duration: "1 hour", place: "Hall B · 204" }, { day: 1, time: "14:00", duration: "50 min", place: "Computer Lab · 2" }, { day: 2, time: "13:00", duration: "2 hours", place: "Lab · 04" }, { day: 3, time: "12:00", duration: "50 min", place: "Room · 112" }, { day: 4, time: "14:00", duration: "50 min", place: "Hall C · 106" },
  ];
  const sessions = state.subjects.map((subject, i) => ({ ...times[i % times.length], title: subject.title, code: subject.code, color: subject.color }));
  const day = state.selectedWeekday;
  const todays = sessions.filter((session) => session.day === day).sort((a, b) => a.time.localeCompare(b.time));
  const start = prettyDate(dateKey(days[0]), { month: "short", day: "numeric" });
  const end = prettyDate(dateKey(days[6]), { month: "short", day: "numeric" });
  return `<section class="timetable-panel panel ${compact ? "compact-timetable" : ""}"><div class="section-heading timetable-heading"><div><span class="eyebrow">A LITTLE STRUCTURE GOES A LONG WAY</span><h2>${compact ? "This week" : "Your weekly rhythm"}</h2><p>${start} — ${end}</p></div><div class="week-controls"><button class="icon-button" data-action="week-prev" aria-label="Previous week">‹</button><button class="today-button" data-action="week-today">Today</button><button class="icon-button" data-action="week-next" aria-label="Next week">›</button></div></div><div class="weekday-row">${days.map((d, i) => `<button class="weekday-button ${day === i ? "selected" : ""} ${d.toDateString() === new Date().toDateString() ? "is-today" : ""}" data-day="${i}"><span>${labels[i]}</span><strong>${d.getDate()}</strong><i>${sessions.filter((session) => session.day === i).length || "·"}</i></button>`).join("")}</div><div class="schedule-list">${todays.length ? todays.map((session) => `<article class="schedule-item ${session.color}"><span class="schedule-time">${session.time}</span><span class="schedule-track"></span><div class="schedule-details"><strong>${escapeHTML(session.title)}</strong><span>${escapeHTML(session.code)} · ${escapeHTML(session.place)}</span></div><span class="schedule-duration">◷ ${session.duration}</span></article>`).join("") : '<div class="free-day">✦<div><strong>A little room to breathe.</strong><span>No classes scheduled for this day.</span></div></div>'}</div>${!compact ? '<div class="timetable-footnote">◷ Times shown in your local timezone</div>' : ""}</section>`;
}
function dashboard() {
  const counts = statusCounts();
  const total = Math.max(state.tasks.length, 1);
  if (state.dashboardTab === "assignments") return `<div class="dashboard-tabs"><button data-tab="overview">Overview</button><button class="active" data-tab="assignments">My assignments <span class="tab-count">${counts.open}</span></button><button data-tab="planner">Study planner</button></div>${taskBoard()}`;
  if (state.dashboardTab === "planner") return `<div class="dashboard-tabs"><button data-tab="overview">Overview</button><button data-tab="assignments">My assignments <span class="tab-count">${counts.open}</span></button><button class="active" data-tab="planner">Study planner</button></div>${timetable()}`;
  return `${thoughtCard()}<div class="dashboard-tabs"><button class="active" data-tab="overview">Overview</button><button data-tab="assignments">My assignments <span class="tab-count">${counts.open}</span></button><button data-tab="planner">Study planner</button></div><div class="metrics-grid">${metric("Active subjects", String(state.subjects.length).padStart(2, "0"), "You’re right on track", "▤", "violet")}${metric("Due this week", String(counts.due).padStart(2, "0"), "A few things to focus on", "◷", "orange")}${metric("Tasks completed", String(counts.done).padStart(2, "0"), "Look at you go", "✓", "green")}${metric("Study streak", "06 days", "Your best is 12 days", "ϟ", "blue")}</div><div class="overview-layout"><div class="overview-main">${taskBoard()}<div class="bottom-insight panel"><span class="insight-icon">✦</span><div><span class="eyebrow">A NOTE FOR YOUR FUTURE SELF</span><strong>One task at a time is still a plan.</strong><span>Keep showing up. You’re doing better than you think.</span></div><span>↗</span></div></div><aside class="right-rail">${goalCard(counts.done, total)}${timetable(true)}<button class="focus-card" data-tab="planner"><span class="focus-icon">◷</span><span><strong>Make space to focus</strong><small>See your week at a glance</small></span>→</button></aside></div>`;
}
function courseCard(subject) {
  const open = state.tasks.filter((task) => task.course === subject.title && task.status !== "completed").length;
  return `<article class="course-card panel"><div class="course-card-head"><span class="course-emblem ${subject.color}" style="background:${subject.tint}">${escapeHTML(subject.icon)}</span><span class="course-code">${escapeHTML(subject.code)}</span><span class="subject-card-actions"><button class="icon-button" title="Rename subject" aria-label="Rename ${escapeHTML(subject.title)}" data-action="edit-subject" data-id="${escapeHTML(subject.id)}">✎</button><button class="icon-button danger-button" title="Delete subject" aria-label="Delete ${escapeHTML(subject.title)}" data-action="delete-subject" data-id="${escapeHTML(subject.id)}">⌫</button></span></div><button class="course-title-button" data-open-subject="${escapeHTML(subject.id)}"><h3>${escapeHTML(subject.title)}</h3></button><p class="instructor-name">${escapeHTML(subject.instructor)}</p><div class="progress-label"><span>Course progress</span><strong>${subject.progress}%</strong></div><div class="progress-track"><span style="width:${subject.progress}%"></span></div><div class="course-card-foot"><span>✓ ${open} open ${open === 1 ? "task" : "tasks"}</span><button data-open-subject="${escapeHTML(subject.id)}">Subject details ›</button></div></article>`;
}
function coursesView() {
  if (state.selectedCourse) return courseDetail(state.selectedCourse);
  return `<div class="content-intro"><div><span class="eyebrow">YOUR SEMESTER, AT A GLANCE</span><h2>Your subjects, thoughtfully organized.</h2><p>Add a class, update a name, or keep the list just right for you.</p></div><span class="course-count-chip">♧ ${state.subjects.length} ${state.subjects.length === 1 ? "subject" : "subjects"}</span></div><div class="subject-manager panel"><div><span class="eyebrow">MAKE IT YOUR OWN</span><strong>Manage your subject list</strong><span>Edits update the names on related assignments, too.</span></div><button class="primary-button" data-action="add-subject">＋ Add subject</button></div>${state.subjects.length ? `<div class="courses-grid">${state.subjects.map(courseCard).join("")}</div>` : '<div class="empty-subjects panel"><strong>Your subject list is clear.</strong><span>Add a subject whenever you’re ready to get started.</span><button class="primary-button" data-action="add-subject">＋ Add a subject</button></div>'}`;
}
function courseDetail(course) {
  const matching = state.tasks.filter((task) => task.course === course.title);
  return `<div class="course-detail"><button class="back-link" data-action="back-courses">← All subjects</button><div class="course-detail-hero panel"><span class="course-emblem large ${course.color}" style="background:${course.tint}">${escapeHTML(course.icon)}</span><div><span class="eyebrow">${escapeHTML(course.code)} · FALL SEMESTER</span><h2>${escapeHTML(course.title)}</h2><p>${escapeHTML(course.instructor)} · ${escapeHTML(course.next)}</p></div><div class="detail-progress"><strong>${course.progress}%</strong><span>course progress</span><div class="progress-track"><span style="width:${course.progress}%"></span></div></div></div><div class="detail-columns"><section class="panel detail-content"><div class="section-heading"><div><span class="eyebrow">YOUR WORK</span><h3>Assignments</h3></div><span class="course-count-chip">${matching.length} items</span></div>${matching.length ? matching.map((task) => `<div class="detail-task"><span class="priority-badge ${task.priority.toLowerCase()}"><i></i>${task.priority}</span><strong>${escapeHTML(task.title)}</strong><small>${task.status === "completed" ? "Completed" : `Due ${relativeDate(task.dueDate)}`}</small></div>`).join("") : '<p class="detail-empty">No assignments for this subject right now.</p>'}</section><section class="panel detail-content"><span class="eyebrow">UP NEXT</span><h3>Course rhythm</h3><div class="module-line"><span>✓</span><div><strong>Weekly practice</strong><small>Keep a few notes as you go</small></div></div><div class="module-line"><span>02</span><div><strong>${escapeHTML(course.next.split(" · ")[0])}</strong><small>${escapeHTML(course.next.split(" · ")[1] || "")}</small></div></div></section></div></div>`;
}
function testsView() {
  const tests = [
    { title: "Mid-semester test", detail: "Concepts & problem solving", subject: state.subjects[0]?.title || "Discrete maths", days: 2, time: "9:00 AM", room: "Lecture Hall B" },
    { title: "Programming assessment", detail: "Classes, objects & inheritance", subject: state.subjects[1]?.title || "Object oriented programming (C++)", days: 5, time: "11:30 AM", room: "Computer Lab 2" },
    { title: "Practical check-in", detail: "Lab skills & data structures", subject: state.subjects[2]?.title || "Data structures", days: 9, time: "2:00 PM", room: "Lab 04" },
    { title: "Unit test", detail: "Logic & compiler fundamentals", subject: state.subjects[3]?.title || "Digital logic and compiler design", days: 14, time: "10:00 AM", room: "Room 112" },
  ];
  return `<div class="study-view"><div class="content-intro"><div><span class="eyebrow">PREPARED, NOT PANICKED</span><h2>Tests &amp; check-ins</h2><p>A clear view of what’s coming, so you can take it one step at a time.</p></div><span class="course-count-chip">◷ ${tests.length} upcoming</span></div><section class="tests-overview panel"><span class="tests-overview-mark">◎</span><div><span class="eyebrow">A GENTLE REMINDER</span><strong>You don’t have to learn it all in one sitting.</strong><span>Pick one topic, make a little progress, then take a breath.</span></div><span class="tests-overview-decoration">✳</span></section><div class="tests-list">${tests.map((test, index) => {
    const date = new Date(); date.setDate(date.getDate() + test.days);
    const saved = state.savedPlans.includes(test.title);
    return `<article class="test-card panel"><div class="test-date-block"><span>${prettyDate(dateKey(date), { month: "short" }).toUpperCase()}</span><strong>${date.getDate()}</strong><small>${prettyDate(dateKey(date), { weekday: "short" })}</small></div><div class="test-main"><div class="test-title-row"><div><span class="test-type ${index === 0 ? "soon" : ""}">${index === 0 ? "COMING UP" : index === 1 ? "ASSESSMENT" : "ON THE HORIZON"}</span><h3>${test.title}</h3></div><span class="test-countdown">In ${test.days} days</span></div><p>${test.detail}</p><div class="test-meta"><span>✦ ${escapeHTML(test.subject)}</span><span>◷ ${test.time}</span><span>▤ ${test.room}</span></div></div><button class="test-action ${saved ? "is-saved" : ""}" aria-label="${saved ? "Remove from" : "Save to"} study plan" data-action="toggle-plan" data-title="${escapeHTML(test.title)}">${saved ? "✓" : "→"}</button></article>`;
  }).join("")}</div></div>`;
}
function practicalView() {
  const labels = ["Experiment notes & observations", "Implementation exercises", "Lab work & diagrams", "Circuit logic workbook", "Method calculations & results"];
  const statuses = ["In progress", "Ready to submit", "Submitted"];
  const submitted = Object.values(state.practical).filter((value) => value === "Submitted").length;
  return `<div class="study-view"><div class="content-intro"><div><span class="eyebrow">A HOME FOR YOUR HANDS-ON WORK</span><h2>Practical file</h2><p>Keep experiments, lab work, and the little details together.</p></div><span class="course-count-chip">▤ ${state.subjects.length} subject files</span></div><section class="practical-summary panel"><span class="practical-summary-icon">✓</span><div><strong>Small notes become a solid record.</strong><p>Update a file as your work moves along. Your status is saved on this device.</p></div><span class="practical-summary-count">${submitted}<small>submitted</small></span></section><div class="practical-list">${state.subjects.length ? state.subjects.map((subject, index) => {
    const status = state.practical[subject.id] || "In progress";
    const next = statuses[(statuses.indexOf(status) + 1) % statuses.length];
    return `<article class="practical-row panel"><span class="course-emblem ${subject.color}" style="background:${subject.tint}">${escapeHTML(subject.icon)}</span><div class="practical-row-main"><span class="course-code">${escapeHTML(subject.code)}</span><h3>${escapeHTML(subject.title)}</h3><p>${labels[index % labels.length]}</p></div><span class="practical-status ${status.toLowerCase().replaceAll(" ", "-")}"><i></i>${status}</span><button class="practical-next" data-action="advance-practical" data-id="${escapeHTML(subject.id)}">${status === "In progress" ? "Mark ready" : status === "Ready to submit" ? "Submit file" : "Reopen"} →</button></article>`;
  }).join("") : '<div class="empty-subjects panel">No subject files yet. Add a subject to start a practical file.</div>'}</div></div>`;
}
function timerMarkup(name, duration, compact = false) {
  const remaining = state.timerRemaining[name] ?? duration;
  const progress = Math.round((duration - remaining) / duration * 100);
  const running = Boolean(state.timerRunning[name]);
  const label = remaining === 0 ? "Complete" : running ? "Pause" : "Start timer";
  return `<div class="activity-timer ${compact ? "compact" : ""}" data-timer="${name}" data-duration="${duration}"><div class="timer-digits" aria-live="polite">${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}</div><div class="timer-track"><span style="width:${progress}%"></span></div><div class="timer-controls"><button class="timer-play" data-action="toggle-timer" data-timer-name="${name}" ${remaining === 0 ? "disabled" : ""}><span>${running ? "Ⅱ" : "▶"}</span>${label}</button><button class="timer-reset" aria-label="Reset timer" data-action="reset-timer" data-timer-name="${name}">↻</button></div></div>`;
}
function meTimeView() {
  return `<div class="me-time-view"><div class="content-intro"><div><span class="eyebrow">A PAUSE IS PART OF THE PLAN</span><h2>A little time for you.</h2><p>Choose a small reset. No streaks, no pressure—just a moment to recharge.</p></div><span class="me-time-heart">❤️</span></div><div class="me-time-grid"><article class="me-time-card meditation-card"><div class="me-time-card-head"><span class="me-time-icon">◉</span><span class="me-time-chip">3 MIN RESET</span></div><span class="eyebrow">COME BACK TO YOUR BREATH</span><h3>Meditation</h3><p>Settle in, soften your shoulders, and let the next few minutes belong to you.</p><div class="breathing-orb"><span>inhale<br>and exhale</span></div>${timerMarkup("meditation", 180)}</article><article class="me-time-card stretch-card"><div class="me-time-card-head"><span class="me-time-icon">✦</span><span class="me-time-chip">5 MIN RESET</span></div><span class="eyebrow">MOVE A LITTLE, FEEL A LITTLE LIGHTER</span><h3>Stretching timer</h3><p>A gentle desk break for your neck, back, and busy hands.</p><div class="stretch-steps"><span><i>01</i> Shoulder rolls <small>30 sec</small></span><span><i>02</i> Neck &amp; side stretch <small>1 min</small></span><span><i>03</i> Reach &amp; breathe <small>1 min</small></span></div>${timerMarkup("stretch", 300)}</article><article class="me-time-card music-card"><audio id="focus-audio" src="studyflow-me-time.mp3" loop preload="none"></audio><div class="me-time-card-head"><span class="me-time-icon music-icon">♫</span><span class="me-time-chip">ABOUT 1 MIN INTERLUDE</span></div><span class="eyebrow">LET YOUR MIND WANDER</span><h3>Listen to music</h3><p>A little original instrumental to make your break feel like yours.</p><div class="music-art"><span class="music-vinyl"><i></i><b></b></span><span class="waveform">${[18,30,22,38,16,33,25,41,20,35,15,28,39,21,34,17,30,22,37,18,29,15].map((height) => `<i style="height:${height}px"></i>`).join("")}</span></div><div class="music-controls"><button class="music-play-button" data-action="toggle-music" aria-label="Play music">▶</button><div class="music-track-label"><strong>Soft focus interlude</strong><span>LogicLoom original · no vocals</span></div><span>◖</span><input id="music-volume" aria-label="Music volume" type="range" min="0" max="100" value="70"></div><p class="music-error" id="music-error" hidden></p></article><article class="me-time-card outdoor-card"><div class="me-time-card-head"><span class="me-time-icon outdoor-icon">♧</span><span class="me-time-chip">15 MIN FRESH AIR</span></div><span class="eyebrow">STEP OUT OF YOUR STUDY SPACE</span><h3>Play outdoors</h3><p>A change of scenery can make room for a fresh idea.</p><div class="outdoor-ideas"><span>♧ Take a walk around campus</span><span>✦ Find a sunny place to sit</span><span>◷ Play a quick game with a friend</span></div>${timerMarkup("outdoors", 900, true)}</article></div><div class="me-time-footer"><span>✓ It’s okay to pause. Your progress will still be here.</span><span>MAKE A LITTLE ROOM FOR YOU ♡</span></div></div>`;
}
function viewContent() {
  if (state.view === "dashboard") return dashboard();
  if (state.view === "courses") return coursesView();
  if (state.view === "assignments") return taskBoard();
  if (state.view === "timetable") return timetable();
  if (state.view === "tests") return testsView();
  if (state.view === "practical") return practicalView();
  if (state.view === "me-time") return meTimeView();
  return dashboard();
}
function renderPage() {
  const main = document.getElementById("main-content");
  const coursesExtra = state.view === "courses" && !state.selectedCourse && state.subjects.length ? '<div class="course-note">✦ <span>Pro tip: A little review after every class makes exam week feel a lot lighter.</span></div>' : "";
  main.innerHTML = `<div class="page-heading-row"><div class="page-heading"><div class="date-kicker"><span class="date-sparkle">✳</span>${todayLabel().toUpperCase()}</div><h1>${escapeHTML(pageName())}</h1><p>${escapeHTML(pageSubtitle())}</p></div><div class="header-status"><span class="status-dot"></span>Semester in session <span class="status-arrow">↗</span></div></div>${viewContent()}${coursesExtra}`;
}
function calendarMarkup() {
  const reminders = state.reminders.filter((item) => item.date === state.selectedDate).sort((a, b) => a.time.localeCompare(b.time));
  const month = state.calendarMonth;
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, index) => { const day = new Date(start); day.setDate(start.getDate() + index); return day; });
  const monthName = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(month);
  const marked = new Set(state.reminders.map((item) => item.date));
  const body = state.calendarOpen ? `<section class="calendar-popover panel" aria-label="Reminder calendar"><div class="calendar-popover-header"><div><span class="eyebrow">KEEP A NOTE FOR LATER</span><h2>Reminders</h2></div><button class="icon-button calendar-close" aria-label="Close calendar" data-action="toggle-calendar">×</button></div><div class="calendar-month-row"><strong>${monthName}</strong><div class="calendar-month-controls"><button class="icon-button" aria-label="Previous month" data-action="month-prev">‹</button><button class="icon-button" aria-label="Next month" data-action="month-next">›</button></div></div><div class="calendar-grid calendar-weekdays">${["M", "T", "W", "T", "F", "S", "S"].map((d, i) => `<span>${d}</span>`).join("")}</div><div class="calendar-grid calendar-date-grid">${days.map((date) => { const key = dateKey(date); return `<button class="calendar-day ${date.getMonth() !== month.getMonth() ? "outside-month" : ""} ${key === state.selectedDate ? "selected" : ""} ${key === dateKey(new Date()) ? "today" : ""}" aria-label="${prettyDate(key, { weekday: "long", month: "long", day: "numeric" })}${marked.has(key) ? ", has reminders" : ""}" data-date="${key}">${date.getDate()}${marked.has(key) ? "<i></i>" : ""}</button>`; }).join("")}</div><div class="selected-day-heading"><div><span class="eyebrow">SELECTED DATE</span><strong>${prettyDate(state.selectedDate, { weekday: "long", month: "long", day: "numeric" })}</strong></div><span class="selected-reminder-count">${reminders.length} ${reminders.length === 1 ? "note" : "notes"}</span></div><form class="reminder-form" id="reminder-form"><label class="reminder-title-field"><span class="sr-only">Reminder name</span><input name="title" required maxlength="72" placeholder="Add a reminder..."></label><label class="reminder-time-field">◷<span class="sr-only">Reminder time</span><input name="time" type="time" required value="09:00"></label><button class="reminder-add-button" type="submit" aria-label="Save reminder">＋</button></form><div class="reminder-list" aria-live="polite">${reminders.length ? reminders.map((item) => `<div class="reminder-row"><span class="reminder-time-pill">${escapeHTML(item.time)}</span><span class="reminder-row-title">${escapeHTML(item.title)}</span><button class="icon-button reminder-delete" aria-label="Delete reminder ${escapeHTML(item.title)}" data-action="delete-reminder" data-id="${escapeHTML(item.id)}">⌫</button></div>`).join("") : '<p class="no-reminders">✓ A clear day, just for you.</p>'}</div></section>` : "";
  return `${body}<button class="calendar-trigger" aria-expanded="${state.calendarOpen}" data-action="toggle-calendar"><span class="calendar-trigger-icon">${icon("calendar")}</span><span>${state.calendarOpen ? "Hide calendar" : "Calendar"}</span><span class="calendar-trigger-count">${state.reminders.length}</span></button>`;
}
function renderApp() {
  document.documentElement.dataset.theme = state.theme;
  document.getElementById("sidebar").innerHTML = sidebar();
  document.getElementById("topbar").innerHTML = header();
  renderPage();
  document.getElementById("page-footer").innerHTML = `<span>Made for your next little win.</span><span>LOGICLOOM <i>·</i> 2026</span>`;
  document.getElementById("calendar-dock").innerHTML = calendarMarkup();
  renderToast();
  renderDialog();
  const audio = document.getElementById("focus-audio");
  if (audio) audio.volume = Number(document.getElementById("music-volume")?.value || 70) / 100;
  document.querySelector(".mobile-scrim")?.remove();
  if (state.mobileOpen) app.insertAdjacentHTML("afterbegin", '<button class="mobile-scrim" data-action="mobile-menu" aria-label="Close navigation"></button>');
  document.getElementById("sidebar").classList.toggle("sidebar-open", state.mobileOpen);
  document.getElementById("app").classList.toggle("menu-open", state.mobileOpen);
}
function renderToast() {
  const root = document.getElementById("toast-root");
  if (!state.toast) { root.innerHTML = ""; return; }
  root.innerHTML = `<aside class="celebration-toast" role="status" aria-live="polite"><div class="celebration-buddies" aria-hidden="true"><span class="buddy bunny">🐰</span><span class="buddy cat">🐱</span><i>✦</i></div><div class="celebration-copy"><span class="celebration-kicker">✓ ONE MORE THING WOVEN IN</span><strong>Look at you go!</strong><span class="celebration-task">“${escapeHTML(state.toast.title)}” is in the done pile.</span></div><button class="celebration-close" data-action="dismiss-toast" aria-label="Dismiss celebration">×</button></aside>`;
}
function showToast(message) {
  state.toast = { title: message, plain: true };
  renderToast();
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => { state.toast = null; renderToast(); }, 4200);
}
function celebrate(taskTitle) {
  state.toast = { title: taskTitle, plain: false };
  renderToast();
  clearTimeout(celebrate.timeout);
  celebrate.timeout = setTimeout(() => { state.toast = null; renderToast(); }, 4800);
}
function renderDialog() {
  const root = document.getElementById("modal-root");
  if (!state.dialog) { root.innerHTML = ""; return; }
  if (state.dialog.type === "task") {
    root.innerHTML = `<div class="modal-backdrop" data-action="backdrop-close"><section class="task-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div class="dialog-header"><div><span class="eyebrow">ONE THING AT A TIME</span><h2 id="dialog-title">Add an assignment</h2></div><button class="icon-button close-button" data-action="close-dialog" aria-label="Close dialog">×</button></div><form id="task-form"><label class="form-field">Assignment name<input name="title" autofocus maxlength="80" required placeholder="e.g. Chapter 5 reading notes"></label><div class="form-row"><label class="form-field">Subject<select name="course">${state.subjects.length ? state.subjects.map((subject) => `<option>${escapeHTML(subject.title)}</option>`).join("") : '<option>Independent study</option>'}</select></label><label class="form-field">Due date<input name="dueDate" type="date" value="${dateOffset(3)}" required></label></div><label class="form-field">Priority<select name="priority"><option>High</option><option selected>Medium</option><option>Low</option></select></label><div class="dialog-actions"><button type="button" class="secondary-button" data-action="close-dialog">Cancel</button><button type="submit" class="primary-button">＋ Create assignment</button></div></form></section></div>`;
  } else if (state.dialog.type === "subject") {
    const subject = state.dialog.subject;
    root.innerHTML = `<div class="modal-backdrop" data-action="backdrop-close"><section class="task-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div class="dialog-header"><div><span class="eyebrow">MAKE IT YOUR OWN</span><h2 id="dialog-title">${subject ? "Rename subject" : "Add a subject"}</h2></div><button class="icon-button close-button" data-action="close-dialog" aria-label="Close dialog">×</button></div><form id="subject-form"><label class="form-field">Subject name<input name="title" autofocus required maxlength="72" placeholder="e.g. Creative writing" value="${escapeHTML(subject?.title || "")}"></label><p class="form-help">Related assignments will follow the new name.</p><div class="dialog-actions"><button type="button" class="secondary-button" data-action="close-dialog">Cancel</button><button type="submit" class="primary-button">${subject ? "Save changes" : "Add subject"}</button></div></form></section></div>`;
  }
}
function chooseView(view) {
  state.view = view;
  state.selectedCourse = null;
  state.mobileOpen = false;
  state.profileOpen = false;
  state.notificationOpen = false;
  state.searchOpen = false;
  if (view === "dashboard") state.dashboardTab = "overview";
  if (view === "assignments") state.dashboardTab = "assignments";
  renderApp();
  document.getElementById("main-content").focus({ preventScroll: true });
}
function moveTask(id, status) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  const wasDone = task.status === "completed";
  task.status = status;
  updateStorage();
  renderApp();
  if (!wasDone && status === "completed") celebrate(task.title);
}
function addTask(data) {
  state.tasks.unshift({ id: `task-${Date.now()}`, title: data.title.trim(), course: data.course || "Independent study", dueDate: data.dueDate, priority: data.priority, status: "todo" });
  state.dialog = null;
  updateStorage();
  renderApp();
  showToast("Your new task is on the board.");
}
function saveSubject(name) {
  const value = name.trim();
  if (!value) return;
  const editing = state.dialog.subject;
  if (state.subjects.some((subject) => subject.title.toLowerCase() === value.toLowerCase() && subject.id !== editing?.id)) {
    showToast("You already have a subject with that name.");
    return;
  }
  if (editing) {
    const previous = editing.title;
    editing.title = value;
    editing.icon = value.slice(0, 1).toUpperCase();
    state.tasks.forEach((task) => { if (task.course === previous) task.course = value; });
    if (state.selectedCourse?.id === editing.id) state.selectedCourse = editing;
  } else {
    const color = subjectColors[state.subjects.length % subjectColors.length];
    state.subjects.push({ id: `subject-${Date.now()}`, title: value, code: `NEW ${String(state.subjects.length + 1).padStart(2, "0")}`, instructor: "Your instructor", progress: 0, ...color, icon: value.slice(0, 1).toUpperCase(), next: "Your next class" });
  }
  state.dialog = null;
  updateStorage();
  renderApp();
}
function renderSearchOnly() {
  document.getElementById("topbar").innerHTML = header();
  const input = document.getElementById("site-search");
  input?.focus();
  input?.setSelectionRange(state.search.length, state.search.length);
}
function updateTimer(name) {
  const element = document.querySelector(`[data-timer="${name}"]`);
  if (!element) return;
  const remaining = state.timerRemaining[name];
  const duration = Number(element.dataset.duration);
  const digit = element.querySelector(".timer-digits");
  const bar = element.querySelector(".timer-track span");
  const button = element.querySelector(".timer-play");
  if (digit) digit.textContent = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
  if (bar) bar.style.width = `${Math.round((duration - remaining) / duration * 100)}%`;
  if (button) { button.disabled = remaining === 0; button.innerHTML = `<span>${state.timerRunning[name] ? "Ⅱ" : "▶"}</span>${remaining === 0 ? "Complete" : state.timerRunning[name] ? "Pause" : "Start timer"}`; }
}
function toggleTimer(name) {
  if (state.timerRunning[name]) {
    clearInterval(timerIntervals[name]);
    delete timerIntervals[name];
    state.timerRunning[name] = false;
  } else {
    if (state.timerRemaining[name] <= 0) return;
    state.timerRunning[name] = true;
    timerIntervals[name] = setInterval(() => {
      state.timerRemaining[name] = Math.max(0, state.timerRemaining[name] - 1);
      updateTimer(name);
      if (state.timerRemaining[name] === 0) {
        clearInterval(timerIntervals[name]);
        delete timerIntervals[name];
        state.timerRunning[name] = false;
        showToast("You made a little time for yourself. Nice work.");
      }
    }, 1000);
  }
  updateTimer(name);
}
function resetTimer(name) {
  clearInterval(timerIntervals[name]);
  delete timerIntervals[name];
  state.timerRunning[name] = false;
  state.timerRemaining[name] = { meditation: 180, stretch: 300, outdoors: 900 }[name];
  updateTimer(name);
}
function setSearch(value) {
  state.search = value;
  state.searchOpen = true;
  renderSearchOnly();
}

// One delegated click listener keeps the page understandable: buttons describe
// their behavior with data-action/data-view attributes in the HTML templates.
document.addEventListener("click", (event) => {
  const target = event.target.closest("button, [data-open-subject], [data-tab]");
  if (!target) return;
  if (target.dataset.view) { chooseView(target.dataset.view); return; }
  if (target.dataset.openSubject) {
    state.view = "courses";
    state.selectedCourse = state.subjects.find((subject) => subject.id === target.dataset.openSubject) || null;
    renderApp(); return;
  }
  if (target.dataset.tab) { state.dashboardTab = target.dataset.tab; renderApp(); return; }
  const action = target.dataset.action;
  if (!action) return;
  if (action === "mobile-menu") { state.mobileOpen = !state.mobileOpen; renderApp(); }
  else if (action === "toggle-theme") { state.theme = state.theme === "light" ? "dark" : "light"; updateStorage(); renderApp(); }
  else if (action === "toggle-profile") { state.profileOpen = !state.profileOpen; state.notificationOpen = false; renderApp(); }
  else if (action === "toggle-notifications") { state.notificationOpen = !state.notificationOpen; state.profileOpen = false; renderApp(); }
  else if (action === "mark-read") { state.noticeRead = true; renderApp(); }
  else if (action === "clear-search") { state.search = ""; state.searchOpen = false; renderApp(); }
  else if (action === "add-task") { state.dialog = { type: "task" }; renderDialog(); document.querySelector('#task-form input[name="title"]')?.focus(); }
  else if (action === "move-task") moveTask(target.dataset.id, target.dataset.status);
  else if (action === "add-subject") { state.dialog = { type: "subject", subject: null }; renderDialog(); document.querySelector('#subject-form input[name="title"]')?.focus(); }
  else if (action === "edit-subject") { state.dialog = { type: "subject", subject: state.subjects.find((subject) => subject.id === target.dataset.id) }; renderDialog(); document.querySelector('#subject-form input[name="title"]')?.focus(); }
  else if (action === "delete-subject") {
    const subject = state.subjects.find((item) => item.id === target.dataset.id);
    if (subject && confirm(`Delete “${subject.title}” from your subjects? Existing assignments will stay on your board.`)) {
      state.subjects = state.subjects.filter((item) => item.id !== subject.id);
      if (state.selectedCourse?.id === subject.id) state.selectedCourse = null;
      updateStorage(); renderApp();
    }
  }
  else if (action === "back-courses") { state.selectedCourse = null; renderApp(); }
  else if (action === "toggle-plan") {
    const title = target.dataset.title;
    state.savedPlans = state.savedPlans.includes(title) ? state.savedPlans.filter((item) => item !== title) : [...state.savedPlans, title];
    updateStorage(); renderApp();
  }
  else if (action === "advance-practical") {
    const subject = state.subjects.find((item) => item.id === target.dataset.id);
    if (!subject) return;
    const states = ["In progress", "Ready to submit", "Submitted"];
    const current = state.practical[subject.id] || states[0];
    state.practical[subject.id] = states[(states.indexOf(current) + 1) % states.length];
    updateStorage(); renderApp();
  }
  else if (action === "week-prev") { state.weekOffset -= 1; renderPage(); }
  else if (action === "week-next") { state.weekOffset += 1; renderPage(); }
  else if (action === "week-today") { state.weekOffset = 0; state.selectedWeekday = (new Date().getDay() + 6) % 7; renderPage(); }
  else if (action === "toggle-calendar") { state.calendarOpen = !state.calendarOpen; document.getElementById("calendar-dock").innerHTML = calendarMarkup(); }
  else if (action === "month-prev") { state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() - 1, 1); document.getElementById("calendar-dock").innerHTML = calendarMarkup(); }
  else if (action === "month-next") { state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() + 1, 1); document.getElementById("calendar-dock").innerHTML = calendarMarkup(); }
  else if (action === "delete-reminder") { state.reminders = state.reminders.filter((item) => item.id !== target.dataset.id); updateStorage(); document.getElementById("calendar-dock").innerHTML = calendarMarkup(); }
  else if (action === "dismiss-toast") { state.toast = null; renderToast(); }
  else if (action === "close-dialog") { state.dialog = null; renderDialog(); }
  else if (action === "toggle-timer") toggleTimer(target.dataset.timerName);
  else if (action === "reset-timer") resetTimer(target.dataset.timerName);
  else if (action === "toggle-music") {
    const audio = document.getElementById("focus-audio");
    if (!audio) return;
    if (audio.paused) audio.play().then(() => { target.textContent = "Ⅱ"; target.setAttribute("aria-label", "Pause music"); document.querySelector(".music-art")?.classList.add("is-playing"); }).catch(() => { const message = document.getElementById("music-error"); if (message) { message.hidden = false; message.textContent = "Tap play once more to start your music."; } });
    else { audio.pause(); target.textContent = "▶"; target.setAttribute("aria-label", "Play music"); document.querySelector(".music-art")?.classList.remove("is-playing"); }
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "site-search") setSearch(event.target.value);
});
document.addEventListener("change", (event) => {
  if (event.target.id === "priority-filter") { state.filter = event.target.value; renderPage(); }
  else if (event.target.id === "music-volume") {
    const audio = document.getElementById("focus-audio");
    if (audio) audio.volume = Number(event.target.value) / 100;
  }
});
document.addEventListener("submit", (event) => {
  if (event.target.id === "task-form") {
    event.preventDefault();
    const data = new FormData(event.target);
    addTask({ title: data.get("title"), course: data.get("course"), dueDate: data.get("dueDate"), priority: data.get("priority") });
  } else if (event.target.id === "subject-form") {
    event.preventDefault();
    const data = new FormData(event.target);
    saveSubject(data.get("title"));
  } else if (event.target.id === "reminder-form") {
    event.preventDefault();
    const data = new FormData(event.target);
    state.reminders.push({ id: `reminder-${Date.now()}`, title: String(data.get("title")).trim(), date: state.selectedDate, time: data.get("time") });
    updateStorage();
    document.getElementById("calendar-dock").innerHTML = calendarMarkup();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (state.dialog) { state.dialog = null; renderDialog(); }
    else if (state.calendarOpen) { state.calendarOpen = false; document.getElementById("calendar-dock").innerHTML = calendarMarkup(); }
    else if (state.searchOpen) { state.searchOpen = false; renderSearchOnly(); }
    else if (state.mobileOpen) { state.mobileOpen = false; renderApp(); }
  }
  if (event.target.id === "site-search" && event.key === "Enter" && state.search.trim()) chooseView("assignments");
});
document.addEventListener("click", (event) => {
  if (event.target.classList?.contains("modal-backdrop")) {
    state.dialog = null;
    renderDialog();
    return;
  }
  const day = event.target.closest("[data-date]");
  if (day) {
    state.selectedDate = day.dataset.date;
    const chosen = new Date(`${state.selectedDate}T00:00:00`);
    if (chosen.getMonth() !== state.calendarMonth.getMonth()) state.calendarMonth = new Date(chosen.getFullYear(), chosen.getMonth(), 1);
    document.getElementById("calendar-dock").innerHTML = calendarMarkup();
  }
  const weekday = event.target.closest("[data-day]");
  if (weekday) { state.selectedWeekday = Number(weekday.dataset.day); renderPage(); }
});
document.addEventListener("dragstart", (event) => {
  const card = event.target.closest(".task-card");
  if (!card) return;
  state.draggedId = card.dataset.taskId;
  event.dataTransfer.setData("text/plain", state.draggedId);
  event.dataTransfer.effectAllowed = "move";
});
document.addEventListener("dragover", (event) => {
  const column = event.target.closest(".board-column");
  if (column) { event.preventDefault(); column.classList.add("drag-over"); }
});
document.addEventListener("dragleave", (event) => {
  const column = event.target.closest(".board-column");
  if (column && !column.contains(event.relatedTarget)) column.classList.remove("drag-over");
});
document.addEventListener("drop", (event) => {
  const column = event.target.closest(".board-column");
  if (!column) return;
  event.preventDefault();
  column.classList.remove("drag-over");
  const id = event.dataTransfer.getData("text/plain") || state.draggedId;
  if (id) moveTask(id, column.dataset.status);
  state.draggedId = null;
});

renderApp();
