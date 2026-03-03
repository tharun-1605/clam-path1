const content = document.getElementById("content");
const navButtons = [...document.querySelectorAll(".sidebar button")];

const views = {
  dashboard: renderDashboard,
  route: renderRoute,
  support: renderSupport,
  community: renderCommunity,
  history: renderHistory,
  profile: renderProfile,
};

function setView(name) {
  navButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.view === name));
  views[name]();
}

function renderDashboard() {
  content.innerHTML = `
    <div class="grid">
      <article class="card span-4">
        <h3>Calm Score</h3>
        <div class="kpi" id="calmScore">76</div>
        <p class="muted">Live stress proxy from recent check-ins.</p>
      </article>
      <article class="card span-4">
        <h3>Safe Havens Nearby</h3>
        <div class="kpi">5</div>
        <p class="muted">Quiet spaces in your configured city.</p>
      </article>
      <article class="card span-4">
        <h3>Community Reports</h3>
        <div class="kpi">23</div>
        <p class="muted">Crowd sourced sensory notes.</p>
      </article>
      <article class="card span-8">
        <h3>Quick Actions</h3>
        <p class="muted">Use the left menu to open each feature module.</p>
        <button class="btn primary" data-go="route">Plan a quiet route</button>
      </article>
      <article class="card span-4">
        <h3>Music Therapy</h3>
        <p class="muted">Spotify embed and calming session timer in next commit.</p>
      </article>
    </div>
  `;
  const goBtn = content.querySelector("[data-go='route']");
  if (goBtn) goBtn.addEventListener("click", () => setView("route"));
}

function renderRoute() {
  content.innerHTML = `
    <article class="card">
      <h3>Sensory-Friendly Route Planning</h3>
      <p class="muted">Map and trigger-avoidance logic added in next commit.</p>
    </article>
  `;
}

function renderSupport() {
  content.innerHTML = `
    <article class="card">
      <h3>Panic / Meltdown Support</h3>
      <p class="muted">Emergency contact and live location alert added in next commit.</p>
    </article>
  `;
}

function renderCommunity() {
  content.innerHTML = `
    <article class="card">
      <h3>Community-Sourced Spaces</h3>
      <p class="muted">Submission and moderation panel added in next commit.</p>
    </article>
  `;
}

function renderHistory() {
  content.innerHTML = `
    <article class="card">
      <h3>History Tracking</h3>
      <p class="muted">Route and trigger history analytics added in next commit.</p>
    </article>
  `;
}

function renderProfile() {
  content.innerHTML = `
    <article class="card">
      <h3>Profile Management</h3>
      <p class="muted">Sensory preferences and caregiver profile added in next commit.</p>
    </article>
  `;
}

navButtons.forEach((btn) => btn.addEventListener("click", () => setView(btn.dataset.view)));
setView("dashboard");
