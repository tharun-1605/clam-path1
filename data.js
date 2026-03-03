const havensByCity = {
  bengaluru: [
    { name: "Cubbon Park Quiet Zone", type: "Low noise green space", lat: 12.977, lng: 77.595 },
    { name: "NIMHANS Support Center", type: "Clinical support", lat: 12.9416, lng: 77.5963 },
    { name: "JP Nagar Community Library", type: "Low sensory indoor", lat: 12.9077, lng: 77.5858 },
  ],
  chennai: [
    { name: "Semmozhi Poonga", type: "Quiet urban park", lat: 13.0567, lng: 80.2517 },
    { name: "Child Guidance Clinic", type: "Support center", lat: 13.0827, lng: 80.2707 },
  ],
  hyderabad: [
    { name: "KBR National Park", type: "Low sensory route", lat: 17.4165, lng: 78.4253 },
    { name: "Autism Ashram Hub", type: "Support center", lat: 17.385, lng: 78.4867 },
  ],
};

export function getSafeHavens(city = "") {
  const key = city.trim().toLowerCase();
  return havensByCity[key] || havensByCity.bengaluru;
}

export function predictCalmScore(noise, crowd, light) {
  const n = Number(noise) || 5;
  const c = Number(crowd) || 5;
  const l = Number(light) || 5;

  // Simple heuristic placeholder for AI-assisted sensory overload estimate.
  const stress = n * 3 + c * 3 + l * 2;
  return Math.max(5, Math.min(95, 100 - stress));
}

export function routeRecommendation(priority) {
  if (priority === "shortest") return "Balanced route: moderate noise, minimum travel time";
  if (priority === "crowd") return "Crowd-avoid route: side roads and non-peak paths";
  return "Quiet-first route: parks, lower traffic streets, fewer horn zones";
}
