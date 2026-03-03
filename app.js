import { initFirebase } from "./firebase.js";
import { getState, syncHint } from "./store.js";

const content = document.getElementById("content");
const navButtons = [...document.querySelectorAll(".sidebar button")];

const appCtx = {
  firebase: { enabled: false },
  user: null,
};

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

async function renderDashboard() {
  const state = getState();
  const mode = await syncHint();

  content.innerHTML = `
    <div class="grid">
      <article class="card span-8">
        <h3>System Status</h3>
        <p><strong>Data mode:</strong> ${mode}</p>
        <p><strong>Auth:</strong> ${appCtx.user ? "Signed in" : "Guest mode"}</p>
        <button class="btn primary" id="authBtn">${appCtx.user ? "Sign out" : "Continue as guest"}</button>
      </article>
      <article class="card span-4">
        <h3>Calm Score</h3>
        <div class="kpi">${state.calmScore}</div>
        <p class="muted">Live stress proxy from recent check-ins.</p>
      </article>
      <article class="card span-4">
        <h3>Safe Havens Nearby</h3>
        <div class="kpi">5</div>
        <p class="muted">Quiet spaces in your configured city.</p>
      </article>
      <article class="card span-4">
        <h3>Community Reports</h3>
        <div class="kpi">${state.communityReports.length}</div>
        <p class="muted">Crowd sourced sensory notes.</p>
      </article>
      <article class="card span-4">
        <h3>History Logs</h3>
        <div class="kpi">${state.routes.length + state.supportEvents.length}</div>
        <p class="muted">Trips and support events recorded.</p>
      </article>
    </div>
  `;

  const authBtn = document.getElementById("authBtn");
  if (authBtn) {
    authBtn.addEventListener("click", () => {
      appCtx.user = appCtx.user ? null : { uid: "guest" };
      renderDashboard();
    });
  }
}

function renderRoute() {
  content.innerHTML = `
    <article class="card">
      <h3>Sensory-Friendly Route Planning</h3>
      <p class="muted">Core planning flow is wired. Mapping and optimization are added in upcoming commit.</p>
      <label>Start point<input class="input" placeholder="Example: MG Road Metro" /></label>
      <label>Destination<input class="input" placeholder="Example: Indiranagar Quiet Cafe" /></label>
      <label>Priority<select><option>Lowest noise</option><option>Shortest distance</option><option>Avoid crowd</option></select></label>
      <button class="btn primary" style="margin-top:10px">Generate quiet route</button>
    </article>
  `;
}

function renderSupport() {
  content.innerHTML = `
    <article class="card">
      <h3>Panic / Meltdown Support</h3>
      <p class="muted">Emergency workflow and caregiver alert integration will be added in next commit.</p>
      <button class="btn danger">Trigger support alert</button>
    </article>
  `;
}

function renderCommunity() {
  content.innerHTML = `
    <article class="card">
      <h3>Community-Sourced Spaces</h3>
      <p class="muted">Create and review autism-friendly spots. Firestore integration added in upcoming commit.</p>
      <label>Place name<input class="input" placeholder="Quiet park / support center" /></label>
      <label>Sensory note<textarea rows="3" placeholder="Noise level, crowd level, light conditions"></textarea></label>
      <button class="btn primary" style="margin-top:10px">Submit report</button>
    </article>
  `;
}

function renderHistory() {
  content.innerHTML = `
    <article class="card">
      <h3>History Tracking</h3>
      <p class="muted">Trip analytics, trigger patterns, and export features added in later commit.</p>
    </article>
  `;
}

function renderProfile() {
  const { profile } = getState();
  content.innerHTML = `
    <article class="card">
      <h3>Profile Management</h3>
      <p class="muted">Configure sensory profile and caregiver contacts.</p>
      <label>Name<input class="input" value="${profile.name}" /></label>
      <label>Caregiver<input class="input" value="${profile.caregiverName}" /></label>
      <label>Caregiver Phone<input class="input" value="${profile.caregiverPhone}" /></label>
      <label>Primary City<input class="input" value="${profile.city}" /></label>
      <label>Sensory Triggers<textarea rows="2">${profile.triggers}</textarea></label>
      <label>Calming Methods<textarea rows="2">${profile.calmingMethods}</textarea></label>
    </article>
  `;
}

async function bootstrap() {
  appCtx.firebase = await initFirebase();
  setView("dashboard");
}

navButtons.forEach((btn) => btn.addEventListener("click", () => setView(btn.dataset.view)));
bootstrap();
