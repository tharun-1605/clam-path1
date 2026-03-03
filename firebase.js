let app = null;
let auth = null;
let db = null;
let storage = null;
let enabled = false;

export async function initFirebase() {
  try {
    const cfgModule = await import("./firebase-config.js");
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
    const authMod = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
    const dbMod = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js");
    const storageMod = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-storage.js");

    app = initializeApp(cfgModule.firebaseConfig);
    auth = authMod.getAuth(app);
    db = dbMod.getFirestore(app);
    storage = storageMod.getStorage(app);
    enabled = true;

    return {
      enabled,
      auth,
      db,
      storage,
      authMod,
      dbMod,
      storageMod,
    };
  } catch (err) {
    console.warn("Firebase not enabled. Using local mode.", err.message);
    return { enabled: false };
  }
}

export function isFirebaseEnabled() {
  return enabled;
}
