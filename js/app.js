/* =====================================================
   Dashboard — app.js
   Vanilla JS, no frameworks, localStorage only
   ===================================================== */

'use strict';

/* ─────────────────────────────────────────
   STORAGE HELPERS
───────────────────────────────────────── */
const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

/* ─────────────────────────────────────────
   THEME
───────────────────────────────────────── */
const themeBtn = document.getElementById('btn-theme');
let currentTheme = store.get('theme', 'dark');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  store.set('theme', theme);
  currentTheme = theme;
}

applyTheme(currentTheme);

themeBtn.addEventListener('click', () => {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

/* ─────────────────────────────────────────
   GREETING — clock, date, name
───────────────────────────────────────── */
const greetingText  = document.getElementById('greeting-text');
const greetingName  = document.getElementById('greeting-name');
const clockEl       = document.getElementById('clock');
const dateEl        = document.getElementById('date-display');
const inputName     = document.getElementById('input-name');
const btnSaveName   = document.getElementById('btn-save-name');

function getGreeting(hour) {
  if (hour >= 5  && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}

function pad(n) { return String(n).padStart(2, '0'); }

function tickClock() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();

  clockEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;

  greetingText.textContent = getGreeting(h);

  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  dateEl.textContent =
    `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}

tickClock();
setInterval(tickClock, 1000);

function loadName() {
  const name = store.get('userName', '');
  greetingName.textContent = name || 'Friend';
  inputName.value = name;
}

function saveName() {
  const name = inputName.value.trim();
  store.set('userName', name);
  greetingName.textContent = name || 'Friend';
}

loadName();
btnSaveName.addEventListener('click', saveName);
inputName.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveName(); });

/* ─────────────────────────────────────────
   FOCUS TIMER
───────────────────────────────────────── */
const timerDisplay  = document.getElementById('timer-display');
const timerStatus   = document.getElementById('timer-status');
const progressFill  = document.getElementById('progress-fill');
const btnStart      = document.getElementById('btn-start');
const btnStop       = document.getElementById('btn-stop');
const btnReset      = document.getElementById('btn-reset');
const timerMinInput = document.getElementById('timer-minutes');
const btnSetTimer   = document.getElementById('btn-set-timer');

let totalSeconds  = store.get('timerDuration', 25) * 60;
let remainSeconds = totalSeconds;
let timerInterval = null;
let isRunning     = false;

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${pad(m)}:${pad(s)}`;
}

function updateTimerUI() {
  timerDisplay.textContent = formatTime(remainSeconds);
  const pct = totalSeconds > 0 ? (remainSeconds / totalSeconds) * 100 : 100;
  progressFill.style.width = `${pct}%`;
}

function setStatus(msg) { timerStatus.textContent = msg; }

function startTimer() {
  if (isRunning) return;
  if (remainSeconds <= 0) resetTimer();
  isRunning = true;
  setStatus('Focusing… 🔥');
  btnStart.disabled = true;

  timerInterval = setInterval(() => {
    remainSeconds--;
    updateTimerUI();

    if (remainSeconds <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      btnStart.disabled = false;
      setStatus('Session complete! 🎉');
      timerDisplay.textContent = '00:00';
      progressFill.style.width = '0%';
      notifyDone();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  btnStart.disabled = false;
  setStatus('Paused');
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  btnStart.disabled = false;
  remainSeconds = totalSeconds;
  updateTimerUI();
  setStatus('Ready to focus');
}

function setCustomTimer() {
  const mins = parseInt(timerMinInput.value, 10);
  if (!mins || mins < 1 || mins > 120) return;
  store.set('timerDuration', mins);
  totalSeconds  = mins * 60;
  remainSeconds = totalSeconds;
  updateTimerUI();
  setStatus('Timer updated — ready!');
  if (isRunning) stopTimer();
}

function notifyDone() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Focus session complete! 🎉', {
      body: 'Time to take a break.',
      icon: '',
    });
  }
}

// Request notification permission once
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

btnStart.addEventListener('click', startTimer);
btnStop.addEventListener('click',  stopTimer);
btnReset.addEventListener('click', resetTimer);
btnSetTimer.addEventListener('click', setCustomTimer);
timerMinInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') setCustomTimer(); });

// Initialize saved duration
(function initTimer() {
  const saved = store.get('timerDuration', 25);
  timerMinInput.value = saved;
  totalSeconds  = saved * 60;
  remainSeconds = totalSeconds;
  updateTimerUI();
})();

/* ─────────────────────────────────────────
   TO-DO LIST
───────────────────────────────────────── */
const todoInput    = document.getElementById('todo-input');
const btnAddTodo   = document.getElementById('btn-add-todo');
const todoList     = document.getElementById('todo-list');
const todoCount    = document.getElementById('todo-count');
const btnClearDone = document.getElementById('btn-clear-done');
const filterBtns   = document.querySelectorAll('.filter-btn');

let tasks       = store.get('tasks', []);
let activeFilter = 'all';

// Modal elements
const editModal     = document.getElementById('edit-modal');
const modalOverlay  = document.getElementById('modal-overlay');
const editInput     = document.getElementById('edit-input');
const btnEditSave   = document.getElementById('btn-edit-save');
const btnEditCancel = document.getElementById('btn-edit-cancel');
let editingId = null;

/* ── Task CRUD ── */
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

function addTask(text) {
  if (!text.trim()) return;
  tasks.unshift({ id: genId(), text: text.trim(), done: false, createdAt: Date.now() });
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (t) t.done = !t.done;
  saveTasks();
  renderTasks();
}

function openEditModal(id) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  editingId = id;
  editInput.value = t.text;
  editModal.classList.add('open');
  modalOverlay.classList.add('open');
  editInput.focus();
  editInput.select();
}

function closeEditModal() {
  editingId = null;
  editModal.classList.remove('open');
  modalOverlay.classList.remove('open');
}

function saveEdit() {
  const text = editInput.value.trim();
  if (!text) return;
  const t = tasks.find(t => t.id === editingId);
  if (t) t.text = text;
  saveTasks();
  renderTasks();
  closeEditModal();
}

function clearDone() {
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  renderTasks();
}

function saveTasks() { store.set('tasks', tasks); }

/* ── Render ── */
function getFilteredTasks() {
  if (activeFilter === 'active') return tasks.filter(t => !t.done);
  if (activeFilter === 'done')   return tasks.filter(t => t.done);
  return tasks;
}

function renderTasks() {
  const filtered = getFilteredTasks();
  todoList.innerHTML = '';

  if (filtered.length === 0) {
    todoList.innerHTML = `<li class="empty-state">No tasks here yet 🎯</li>`;
  } else {
    filtered.forEach(t => {
      const li = document.createElement('li');
      li.className = `todo-item${t.done ? ' done' : ''}`;
      li.dataset.id = t.id;

      li.innerHTML = `
        <input type="checkbox" class="todo-item__checkbox" ${t.done ? 'checked' : ''}
               aria-label="Mark task done" />
        <span class="todo-item__text">${escapeHtml(t.text)}</span>
        <div class="todo-item__actions">
          <button class="todo-item__btn todo-item__btn--edit"   title="Edit">✏️</button>
          <button class="todo-item__btn todo-item__btn--delete" title="Delete">🗑️</button>
        </div>
      `;

      li.querySelector('.todo-item__checkbox').addEventListener('change', () => toggleTask(t.id));
      li.querySelector('.todo-item__btn--edit').addEventListener('click', () => openEditModal(t.id));
      li.querySelector('.todo-item__btn--delete').addEventListener('click', () => deleteTask(t.id));

      todoList.appendChild(li);
    });
  }

  // Count active tasks
  const active = tasks.filter(t => !t.done).length;
  todoCount.textContent = `${active} task${active !== 1 ? 's' : ''} left`;
}

/* ── Events ── */
btnAddTodo.addEventListener('click', () => {
  addTask(todoInput.value);
  todoInput.value = '';
  todoInput.focus();
});

todoInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    addTask(todoInput.value);
    todoInput.value = '';
  }
});

btnClearDone.addEventListener('click', clearDone);

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderTasks();
  });
});

btnEditSave.addEventListener('click', saveEdit);
btnEditCancel.addEventListener('click', closeEditModal);
modalOverlay.addEventListener('click', closeEditModal);
editInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter')  saveEdit();
  if (e.key === 'Escape') closeEditModal();
});

renderTasks();

/* ─────────────────────────────────────────
   QUICK LINKS
───────────────────────────────────────── */
const linkLabel   = document.getElementById('link-label');
const linkUrl     = document.getElementById('link-url');
const btnAddLink  = document.getElementById('btn-add-link');
const linksGrid   = document.getElementById('links-grid');

let links = store.get('quickLinks', [
  { id: genId(), label: 'GitHub',   url: 'https://github.com' },
  { id: genId(), label: 'YouTube',  url: 'https://youtube.com' },
  { id: genId(), label: 'Google',   url: 'https://google.com' },
]);

function getFavicon(url) {
  try {
    const origin = new URL(url).origin;
    return `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(origin)}`;
  } catch {
    return '';
  }
}

function domainEmoji(url) {
  // Fallback emoji when favicon fails
  try {
    const host = new URL(url).hostname;
    if (host.includes('github'))    return '🐙';
    if (host.includes('youtube'))   return '▶️';
    if (host.includes('google'))    return '🔍';
    if (host.includes('twitter') || host.includes('x.com')) return '🐦';
    if (host.includes('facebook'))  return '📘';
    if (host.includes('instagram')) return '📷';
    if (host.includes('reddit'))    return '🤖';
    if (host.includes('netflix'))   return '🎬';
    if (host.includes('spotify'))   return '🎵';
    if (host.includes('notion'))    return '📝';
    if (host.includes('figma'))     return '🎨';
  } catch { /* noop */ }
  return '🌐';
}

function addLink() {
  const label = linkLabel.value.trim();
  const url   = linkUrl.value.trim();
  if (!label || !url) return;

  let fullUrl = url;
  if (!/^https?:\/\//i.test(fullUrl)) fullUrl = 'https://' + fullUrl;

  links.push({ id: genId(), label, url: fullUrl });
  saveLinks();
  renderLinks();
  linkLabel.value = '';
  linkUrl.value   = '';
  linkLabel.focus();
}

function deleteLink(id) {
  links = links.filter(l => l.id !== id);
  saveLinks();
  renderLinks();
}

function saveLinks() { store.set('quickLinks', links); }

function renderLinks() {
  linksGrid.innerHTML = '';

  if (links.length === 0) {
    linksGrid.innerHTML = `<p class="empty-state">No links yet 🔗</p>`;
    return;
  }

  links.forEach(link => {
    const chip = document.createElement('div');
    chip.className  = 'link-chip';
    chip.title      = link.url;

    const faviconSrc = getFavicon(link.url);
    const emoji      = domainEmoji(link.url);

    chip.innerHTML = `
      <button class="link-chip__delete" title="Remove link" aria-label="Remove ${escapeHtml(link.label)}">✕</button>
      <div class="link-chip__icon">
        ${faviconSrc
          ? `<img src="${faviconSrc}" width="28" height="28"
                  alt="" loading="lazy"
                  onerror="this.style.display='none';this.nextSibling.style.display='block'"
             /><span style="display:none">${emoji}</span>`
          : `<span>${emoji}</span>`}
      </div>
      <span class="link-chip__label">${escapeHtml(link.label)}</span>
    `;

    // Click chip → open link
    chip.addEventListener('click', (e) => {
      if (e.target.closest('.link-chip__delete')) return;
      window.open(link.url, '_blank', 'noopener,noreferrer');
    });

    chip.querySelector('.link-chip__delete').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteLink(link.id);
    });

    linksGrid.appendChild(chip);
  });
}

btnAddLink.addEventListener('click', addLink);
linkUrl.addEventListener('keydown',   (e) => { if (e.key === 'Enter') addLink(); });
linkLabel.addEventListener('keydown', (e) => { if (e.key === 'Enter') addLink(); });

renderLinks();

/* ─────────────────────────────────────────
   UTILITY
───────────────────────────────────────── */
function escapeHtml(str) {
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}
