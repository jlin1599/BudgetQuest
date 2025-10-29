// Lightweight prototype state stored in localStorage
const STORAGE_KEY = "budgetquest:v1";

const defaultState = {
  level: 1,
  xp: 0, // 0..100 for current level
  coins: 0,
  budget: 0,
  spent: 0,
  quests: [], // {id,name,target,progress,done,badge}
  streak: {
    // days: array of 7 booleans, starting Monday, resets weekly
    weekStartISO: weekStartISO(new Date()),
    days: [false, false, false, false, false, false, false]
  },
  chartHistory: [] // {monthISO, budget, spent}
};

let state = loadState();

// Elements
const coinsEl = document.getElementById("coins");
const levelLabelEl = document.getElementById("levelLabel");
const xpFillEl = document.getElementById("xpFill");
const buyHatBtn = document.getElementById("buyHatBtn");
const avatarEl = document.getElementById("avatar");

const budgetForm = document.getElementById("budgetForm");
const budgetInput = document.getElementById("budgetInput");
const spentInput = document.getElementById("spentInput");
const budgetFillEl = document.getElementById("budgetFill");
const budgetHintEl = document.getElementById("budgetHint");

const questForm = document.getElementById("questForm");
const questNameInput = document.getElementById("questName");
const questTargetInput = document.getElementById("questTarget");
const questListEl = document.getElementById("questList");

const streakRowEl = document.getElementById("streakRow");
const logTodayBtn = document.getElementById("logTodayBtn");

let chart;

// Init
renderAll();
initEvents();

function initEvents(){
  budgetForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const budget = clamp(parseFloat(budgetInput.value || 0), 0, 1e9);
    const spent  = clamp(parseFloat(spentInput.value || 0), 0, 1e9);
    state.budget = budget; state.spent = spent;
    // Reward: if spent <= 80% of budget, grant XP and coins
    if (budget > 0){
      const ratio = spent / budget;
      if (ratio <= 0.8){ gainReward(10, 5); }
      else if (ratio <= 1){ gainReward(5, 2); }
    }
    upsertMonthlyHistory();
    saveState();
    renderBudget();
    renderHeader();
    renderChart();
  });

  questForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const name = (questNameInput.value || "").trim();
    const target = clamp(parseFloat(questTargetInput.value || 0), 1, 1e9);
    if (!name || !target) return;
    state.quests.push({
      id: cryptoRandomId(), name, target, progress: 0, done: false, badge: false
    });
    questNameInput.value = ""; questTargetInput.value = "";
    saveState();
    renderQuests();
  });

  logTodayBtn.addEventListener("click", ()=>{
    ensureCurrentWeek(state);
    const idx = weekdayIndex(new Date());
    if (!state.streak.days[idx]){
      state.streak.days[idx] = true;
      // small bonus for daily log
      gainReward(2, 1);
      // weekly bonus if all complete
      if (state.streak.days.every(Boolean)){
        gainReward(15, 10);
      }
      saveState();
      renderStreak();
      renderHeader();
    }
  });

  buyHatBtn.addEventListener("click", ()=>{
    if (state.coins < 20) return;
    state.coins -= 20;
    avatarEl.classList.add("hat");
    saveState();
    renderHeader();
    renderAvatar();
  });
}

// Rendering
function renderAll(){
  renderHeader();
  renderAvatar();
  renderBudget();
  renderQuests();
  renderStreak();
  renderChart();
}

function renderHeader(){
  coinsEl.textContent = `🪙 ${state.coins}`;
  levelLabelEl.textContent = `Lvl ${state.level}`;
  xpFillEl.style.width = `${clamp(state.xp,0,100)}%`;
  buyHatBtn.disabled = state.coins < 20 || avatarEl.classList.contains("hat");
}

function renderAvatar(){
  if (avatarEl.classList.contains("hat") || state.coins >= 20){
    avatarEl.style.setProperty("--hat","visible");
  }
}

function renderBudget(){
  const {budget, spent} = state;
  budgetInput.value = budget || "";
  spentInput.value = spent || "";
  let pct = 0; let cls = "ok";
  if (budget > 0){
    pct = clamp((spent / budget) * 100, 0, 100);
    cls = pct <= 80 ? "ok" : pct <= 100 ? "warn" : "bad";
    budgetHintEl.textContent = `${Math.round(pct)}% of budget used`;
  } else {
    budgetHintEl.textContent = "Set a budget to begin.";
  }
  budgetFillEl.classList.remove("ok","warn","bad");
  budgetFillEl.classList.add(cls);
  budgetFillEl.style.width = `${pct}%`;
}

function renderQuests(){
  questListEl.innerHTML = "";
  state.quests.forEach(q=>{
    const li = document.createElement("li");
    li.className = "quest-item";
    li.innerHTML = `
      <div class="quest-top">
        <span class="quest-name">${escapeHTML(q.name)}</span>
        <div class="bar">
          <div class="bar-fill" style="width:${Math.min(100,(q.progress/q.target)*100)}%"></div>
        </div>
        <span class="hint">$${q.progress} / $${q.target}</span>
      </div>
      <div class="quest-controls">
        ${q.done ? '<span class="quest-badge">Completed</span>' : ''}
        <input type="number" min="1" step="1" placeholder="+$" />
        <button class="btn small">Add</button>
      </div>
    `;
    const input = li.querySelector("input");
    const addBtn = li.querySelector("button");
    addBtn.addEventListener("click", ()=>{
      const add = clamp(parseFloat(input.value||0),0,1e9);
      if (!add) return;
      q.progress = clamp(q.progress + add, 0, q.target);
      // reward based on percent achieved
      gainReward(5, 2);
      if (!q.done && q.progress >= q.target){
        q.done = true;
        q.badge = true;
        // big completion reward
        gainReward(25, 15);
      }
      saveState();
      renderQuests();
      renderHeader();
    });
    questListEl.appendChild(li);
  });
}

function renderStreak(){
  ensureCurrentWeek(state);
  streakRowEl.innerHTML = "";
  const labels = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  state.streak.days.forEach((on, i)=>{
    const d = document.createElement("div");
    d.className = `streak-dot ${on?"on":""}`;
    d.title = labels[i];
    streakRowEl.appendChild(d);
  });
}

function renderChart(){
  const ctx = document.getElementById("budgetChart");
  if (!ctx) return;
  const labels = state.chartHistory.map(h=>h.monthISO);
  const budgets = state.chartHistory.map(h=>h.budget);
  const spents = state.chartHistory.map(h=>h.spent);
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Budget", data: budgets, backgroundColor: "#7aa2ff" },
        { label: "Spent", data: spents, backgroundColor: "#ff7575" }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#e9f0ff" } } },
      scales: {
        x: { ticks: { color: "#9bb0e0" }, grid: { color: "rgba(255,255,255,.08)" } },
        y: { ticks: { color: "#9bb0e0" }, grid: { color: "rgba(255,255,255,.08)" } }
      }
    }
  });
}

// Rewards and leveling
function gainReward(xp, coins){
  state.xp = clamp(state.xp + xp, 0, 1000); // allow overflow for loop
  state.coins = clamp(state.coins + coins, 0, 1e9);
  while (state.xp >= 100){
    state.xp -= 100;
    state.level += 1;
  }
}

// Persistence
function loadState(){
  try{ const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return {...defaultState};
    const parsed = JSON.parse(raw);
    // migrate streak week if needed
    ensureCurrentWeek(parsed);
    return { ...defaultState, ...parsed };
  }catch{ return {...defaultState}; }
}
function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Utilities
function clamp(n, min, max){ return Math.max(min, Math.min(max, Number.isFinite(n)?n:0)); }
function cryptoRandomId(){ return Math.random().toString(36).slice(2,9); }
function escapeHTML(s){ return s.replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }

function weekStartISO(date){
  const d = new Date(date);
  const day = (d.getDay()+6)%7; // Monday=0
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0,10);
}
function weekdayIndex(date){
  return (date.getDay()+6)%7; // Mon=0..Sun=6
}
function ensureCurrentWeek(s){
  const ws = weekStartISO(new Date());
  if (!s.streak || s.streak.weekStartISO !== ws){
    s.streak = { weekStartISO: ws, days: [false,false,false,false,false,false,false] };
  }
}
function upsertMonthlyHistory(){
  const monthISO = new Date().toISOString().slice(0,7);
  const idx = state.chartHistory.findIndex(h=>h.monthISO===monthISO);
  const entry = { monthISO, budget: state.budget, spent: state.spent };
  if (idx === -1) state.chartHistory.push(entry); else state.chartHistory[idx] = entry;
}


