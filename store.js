import { isFirebaseEnabled } from "./firebase.js";

const KEY = "neuro_nav_local_state_v1";

const defaultState = {
  profile: {
    name: "",
    caregiverName: "",
    caregiverPhone: "",
    city: "Bengaluru",
    triggers: "Loud traffic, sirens",
    calmingMethods: "Lo-fi music, deep breathing",
  },
  calmScore: 76,
  checkIns: [],
  routes: [],
  supportEvents: [],
  communityReports: [],
};

let state = loadLocal();

function loadLocal() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return structuredClone(defaultState);
  try {
    return { ...structuredClone(defaultState), ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveLocal() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getState() {
  return state;
}

export function updateState(patch) {
  state = { ...state, ...patch };
  saveLocal();
}

export function appendItem(key, item) {
  state[key] = [item, ...(state[key] || [])].slice(0, 100);
  saveLocal();
}

export function updateProfile(profile) {
  state.profile = { ...state.profile, ...profile };
  saveLocal();
}

export function setCalmScore(score) {
  state.calmScore = Math.max(1, Math.min(100, Number(score) || 50));
  saveLocal();
}

export async function syncHint() {
  return isFirebaseEnabled() ? "Firebase sync active" : "Local mode active";
}
