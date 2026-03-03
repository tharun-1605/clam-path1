import { initFirebase } from "./firebase.js";
import {
  appendItem,
  getState,
  setCalmScore,
  syncHint,
  updateProfile,
} from "./store.js";
import { getSafeHavens, predictCalmScore, routeRecommendation } from "./data.js";

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

function fmtTime(ts = Date.now()) {
  return new Date(ts).toLocaleString();
}

function mapsPlaceUrl(name, lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${lat},${lng}`)}`;
}

function mapsDirectionsUrl(origin, destination) {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=walking`;
}

function setView(name) {
  navButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.view === name));
  views[name]();
}

async function renderDashboard() {
  const state = getState();
  const mode = await syncHint();
  const havens = getSafeHavens(state.profile.city);

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
        <p class="muted">Updated from sensory check-in and support events.</p>
      </article>
      <article class="card span-4">
        <h3>Safe Havens Nearby</h3>
        <div class="kpi">${havens.length}</div>
        <p class="muted">Top autism-friendly places for ${state.profile.city}.</p>
      </article>
      <article class="card span-4">
        <h3>Community Reports</h3>
        <div class="kpi">${state.communityReports.length}</div>
        <p class="muted">Crowd sourced sensory notes.</p>
      </article>
      <article class="card span-4">
        <h3>Support Alerts</h3>
        <div class="kpi">${state.supportEvents.length}</div>
        <p class="muted">Meltdown/panic events recorded.</p>
      </article>
      <article class="card span-8">
        <h3>Calm Score Monitoring</h3>
        <p class="muted">Rate current environment (1 low -> 10 high).</p>
        <div class="grid">
          <label class="span-4">Noise<input id="noise" class="input" type="number" min="1" max="10" value="5" /></label>
          <label class="span-4">Crowd<input id="crowd" class="input" type="number" min="1" max="10" value="5" /></label>
          <label class="span-4">Light<input id="light" class="input" type="number" min="1" max="10" value="5" /></label>
        </div>
        <button class="btn primary" id="scoreBtn" style="margin-top:10px">Update calm score</button>
        <p id="scoreOut" class="muted"></p>
      </article>
      <article class="card span-4">
        <h3>Music Therapy</h3>
        <iframe title="Spotify calm playlist" style="border-radius:12px;width:100%;height:152px;border:none" src="https://open.spotify.com/embed/playlist/37i9dQZF1DX3rxVfibe1L0?utm_source=generator"></iframe>
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

  document.getElementById("scoreBtn")?.addEventListener("click", () => {
    const score = predictCalmScore(
      document.getElementById("noise").value,
      document.getElementById("crowd").value,
      document.getElementById("light").value,
    );
    setCalmScore(score);
    appendItem("checkIns", { score, at: Date.now() });
    document.getElementById("scoreOut").textContent = `Calm score set to ${score} at ${fmtTime()}`;
    setTimeout(() => renderDashboard(), 500);
  });
}

function renderRoute() {
  const { profile } = getState();
  const havens = getSafeHavens(profile.city);

  content.innerHTML = `
    <article class="card">
      <h3>Sensory-Friendly Route Planning</h3>
      <p class="muted">AI-assisted quiet route preference built on top of Google Maps directions.</p>
      <label>Start point<input class="input" id="from" placeholder="Example: MG Road Metro" /></label>
      <label>Destination<input class="input" id="to" placeholder="Example: Cubbon Park" /></label>
      <label>Priority
        <select id="priority">
          <option value="quiet">Lowest noise</option>
          <option value="shortest">Shortest distance</option>
          <option value="crowd">Avoid crowd</option>
        </select>
      </label>
      <button class="btn primary" style="margin-top:10px" id="routeBtn">Generate quiet route</button>
      <p id="routeText" class="muted"></p>
      <div id="routeLinks"></div>
    </article>
    <article class="card" style="margin-top:12px">
      <h3>Safe Havens (${profile.city})</h3>
      ${havens
        .map(
          (h) => `<p><strong>${h.name}</strong> - ${h.type} - <a target="_blank" href="${mapsPlaceUrl(h.name, h.lat, h.lng)}">Open in Maps</a></p>`,
        )
        .join("")}
    </article>
  `;

  document.getElementById("routeBtn")?.addEventListener("click", () => {
    const from = document.getElementById("from").value.trim();
    const to = document.getElementById("to").value.trim();
    const priority = document.getElementById("priority").value;
    if (!from || !to) {
      document.getElementById("routeText").textContent = "Enter both start and destination.";
      return;
    }

    const rec = routeRecommendation(priority);
    document.getElementById("routeText").textContent = rec;
    document.getElementById("routeLinks").innerHTML = `<a target="_blank" href="${mapsDirectionsUrl(from, to)}">Open route in Google Maps</a>`;

    appendItem("routes", {
      from,
      to,
      priority,
      recommendation: rec,
      at: Date.now(),
    });
  });
}

function renderSupport() {
  const { profile } = getState();

  content.innerHTML = `
    <article class="card">
      <h3>Panic / Meltdown Support Button</h3>
      <p class="muted">Sends caregiver-ready alert payload with location and timestamp.</p>
      <p><strong>Caregiver:</strong> ${profile.caregiverName || "Not set"} (${profile.caregiverPhone || "No number"})</p>
      <button class="btn danger" id="panicBtn">Trigger support alert</button>
      <p id="panicOut" class="muted"></p>
      <div id="panicLinks"></div>
    </article>
  `;

  document.getElementById("panicBtn")?.addEventListener("click", () => {
    const out = document.getElementById("panicOut");
    const links = document.getElementById("panicLinks");
    out.textContent = "Getting current location...";

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        const message = `Neuro Nav Alert: User needs support now. Location: ${mapsUrl}. Time: ${fmtTime()}`;
        const phone = (profile.caregiverPhone || "").replace(/\s+/g, "");
        const smsUrl = phone ? `sms:${phone}?body=${encodeURIComponent(message)}` : "";

        appendItem("supportEvents", { lat, lng, message, at: Date.now() });
        setCalmScore(Math.max(10, getState().calmScore - 20));

        out.textContent = "Support alert ready. Share immediately.";
        links.innerHTML = `
          <p><a target="_blank" href="${mapsUrl}">Open live location</a></p>
          ${smsUrl ? `<p><a href="${smsUrl}">Send SMS to caregiver</a></p>` : "<p class='warning'>Add caregiver phone in profile for one-tap SMS.</p>"}
          <textarea class="input" rows="3">${message}</textarea>
        `;
      },
      () => {
        out.textContent = "Location access blocked. Enable geolocation and retry.";
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}

function renderCommunity() {
  const state = getState();

  content.innerHTML = `
    <article class="card">
      <h3>Community-Sourced Autism-Friendly Spaces</h3>
      <p class="muted">Report low-sensory places. Entries can be validated later via web-scraper pipeline.</p>
      <label>Place name<input class="input" id="placeName" placeholder="Quiet park / support center" /></label>
      <label>City<input class="input" id="placeCity" placeholder="City" value="${state.profile.city}" /></label>
      <label>Sensory note<textarea rows="3" id="placeNote" placeholder="Noise, crowd, lighting conditions"></textarea></label>
      <button class="btn primary" style="margin-top:10px" id="submitReport">Submit report</button>
    </article>
    <article class="card" style="margin-top:12px">
      <h3>Recent Community Reports</h3>
      <div id="reportsList">
        ${state.communityReports.length ? state.communityReports.map((r) => `<p><strong>${r.place}</strong> (${r.city}) - ${r.note} <span class="muted">${fmtTime(r.at)}</span></p>`).join("") : "<p class='muted'>No reports yet.</p>"}
      </div>
    </article>
  `;

  document.getElementById("submitReport")?.addEventListener("click", () => {
    const place = document.getElementById("placeName").value.trim();
    const city = document.getElementById("placeCity").value.trim();
    const note = document.getElementById("placeNote").value.trim();
    if (!place || !city || !note) return;

    appendItem("communityReports", { place, city, note, at: Date.now(), status: "pending-validation" });
    renderCommunity();
  });
}

function renderHistory() {
  const state = getState();
  const rows = [...state.routes, ...state.supportEvents, ...state.checkIns].sort((a, b) => b.at - a.at);

  content.innerHTML = `
    <article class="card">
      <h3>History Tracking & Trip Analytics</h3>
      <p class="muted">Includes route generation, panic events, and calm check-ins.</p>
      <div>
        ${rows.length
          ? rows
              .map((r) => {
                if (r.from) return `<p><strong>Route:</strong> ${r.from} -> ${r.to} (${r.priority}) <span class="muted">${fmtTime(r.at)}</span></p>`;
                if (r.lat) return `<p><strong>Support Alert:</strong> ${r.lat}, ${r.lng} <span class="muted">${fmtTime(r.at)}</span></p>`;
                return `<p><strong>Calm Score:</strong> ${r.score} <span class="muted">${fmtTime(r.at)}</span></p>`;
              })
              .join("")
          : "<p class='muted'>No events yet.</p>"}
      </div>
    </article>
  `;
}

function renderProfile() {
  const { profile } = getState();
  content.innerHTML = `
    <article class="card">
      <h3>Profile Management</h3>
      <p class="muted">Sensory preferences, caregiver contacts, and location preferences.</p>
      <label>Name<input class="input" id="pName" value="${profile.name}" /></label>
      <label>Caregiver<input class="input" id="pCaregiver" value="${profile.caregiverName}" /></label>
      <label>Caregiver Phone<input class="input" id="pPhone" value="${profile.caregiverPhone}" /></label>
      <label>Primary City<input class="input" id="pCity" value="${profile.city}" /></label>
      <label>Sensory Triggers<textarea rows="2" id="pTriggers">${profile.triggers}</textarea></label>
      <label>Calming Methods<textarea rows="2" id="pCalm">${profile.calmingMethods}</textarea></label>
      <button class="btn primary" style="margin-top:10px" id="saveProfile">Save profile</button>
      <p class="muted" id="profileOut"></p>
    </article>
  `;

  document.getElementById("saveProfile")?.addEventListener("click", () => {
    updateProfile({
      name: document.getElementById("pName").value.trim(),
      caregiverName: document.getElementById("pCaregiver").value.trim(),
      caregiverPhone: document.getElementById("pPhone").value.trim(),
      city: document.getElementById("pCity").value.trim() || "Bengaluru",
      triggers: document.getElementById("pTriggers").value.trim(),
      calmingMethods: document.getElementById("pCalm").value.trim(),
    });
    document.getElementById("profileOut").textContent = `Profile saved at ${fmtTime()}`;
  });
}

async function bootstrap() {
  appCtx.firebase = await initFirebase();
  setView("dashboard");
}

navButtons.forEach((btn) => btn.addEventListener("click", () => setView(btn.dataset.view)));
bootstrap();
