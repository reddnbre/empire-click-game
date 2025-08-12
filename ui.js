/* ========= EmpireClick Overlay & Message Utils ========= */

// Toasts
(function setupToasts(){
  if (document.querySelector(".ec-toast-container")) return;
  const c = document.createElement("div");
  c.className = "ec-toast-container";
  document.body.appendChild(c);
})();
function showToast(msg, type="info", ms=2400){
  const c = document.querySelector(".ec-toast-container");
  const t = document.createElement("div");
  t.className = `ec-toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(()=> {
    t.style.opacity = "0";
    t.style.transform = "translateY(6px)";
    setTimeout(()=> t.remove(), 180);
  }, ms);
}

// Game Message (hero banner)
let _gmTimer = null;
function showGameMessage(text, {ms=2200} = {}){
  const el = document.getElementById("gameMessage");
  if (!el) return console.warn("No #gameMessage element");
  clearTimeout(_gmTimer);
  el.textContent = text;
  el.style.display = "block";
  _gmTimer = setTimeout(()=> { el.style.display = "none"; }, ms);
}

// Modal helpers (works with your .modal / .modal-content)
function openModal(id){
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("is-open");
}
function closeModal(id){
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("is-open");
}
// Optional: click backdrop to close (only if target has .modal)
document.addEventListener("click", (e)=>{
  const m = e.target.closest(".modal");
  if (m && e.target === m) m.classList.remove("is-open");
});

// Plot Info panel API (uses existing #plotInfoPanel)
function showPlotInfo({name="N/A", owner="Unclaimed", rarity="Unknown"}){
  const box = document.getElementById("plotInfoPanel");
  if (!box) return;
  if (!box.classList.contains("ec-glass")) box.classList.add("ec-glass");

  // Build nice layout once
  if (!box.dataset.wired){
    box.innerHTML = `
      <div class="ec-title" style="margin-bottom:8px;">Plot Details</div>
      <div class="row"><div class="label">Name</div><div class="value" id="piName"></div></div>
      <div class="row"><div class="label">Owner</div><div class="value" id="piOwner"></div></div>
      <div class="row"><div class="label">Rarity</div>
        <div class="value"><span class="tag" id="piRarity"></span></div></div>
    `;
    box.dataset.wired = "1";
  }
  box.querySelector("#piName").textContent = name;
  box.querySelector("#piOwner").textContent = owner;
  box.querySelector("#piRarity").textContent = rarity;

  // Accent by rarity
  const tag = box.querySelector("#piRarity");
  tag.style.borderColor = ({
    Common:"#94a3b8", Rare:"#60a5fa", Epic:"#a78bfa", Legendary:"#f59e0b", Elite:"#10b981"
  }[rarity]||"#94a3b8");

  box.style.display = "block";
}
function hidePlotInfo(){
  const box = document.getElementById("plotInfoPanel");
  if (box) box.style.display = "none";
}

// Export to window if you like calling from game logic
window.showToast = showToast;
window.showGameMessage = showGameMessage;
window.showPlotInfo = showPlotInfo;
window.hidePlotInfo = hidePlotInfo;
window.openModal = openModal;
window.closeModal = closeModal;

// UI Functions
function toggleMiddleUIPanel() {
    const panel = document.querySelector('.game-panels');
    const btn = document.getElementById('toggleMiddleUI');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        btn.innerText = '🔽 Hide Info Panels';
    } else {
        panel.style.display = 'none';
        btn.innerText = '▶ Show Info Panels';
    }
}

// Additional UI helper functions
function showGameMessage(message, duration = 3000) {
    const gameMessage = document.getElementById('gameMessage');
    if (gameMessage) {
        gameMessage.textContent = message;
        gameMessage.style.display = 'block';
        
        setTimeout(() => {
            gameMessage.style.display = 'none';
        }, duration);
    }
}

function updateActivity() {
    if (game && game.updateActivity) {
        game.updateActivity();
    }
}

// Add activity tracking for offline earnings
document.addEventListener('mousedown', updateActivity);
document.addEventListener('keydown', updateActivity);
document.addEventListener('click', updateActivity);
document.addEventListener('touchstart', updateActivity);

// Check for visibility changes (tab switching)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log("Tab hidden");
    } else {
        updateActivity();
    }
}); 