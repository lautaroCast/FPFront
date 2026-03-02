// ===============================
// Auth – LocalStorage keys
// ===============================

const USERS_KEY = "users_auth";
const CURRENT_USER_KEY = "current_user";
const CLIENT_ID_KEY = "current_client_id";

// ===============================
// Helpers internos (NO exportados)
// ===============================

function getStoredUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ===============================
// Auth – API pública
// ===============================

export function registerAuth(email, password) {
  const users = getStoredUsers();

  if (users[email]) {
    throw new Error("Este email ya está registrado");
  }

  users[email] = password;
  saveUsers(users);
}

export function loginAuth(email, password) {
  const users = getStoredUsers();

  if (!users[email]) {
    throw new Error("Usuario no encontrado");
  }

  if (users[email] !== password) {
    throw new Error("Contraseña incorrecta");
  }

  localStorage.setItem(CURRENT_USER_KEY, email);
}

export function logoutAuth() {
  localStorage.removeItem(CURRENT_USER_KEY);
  clearClientId();
}

export function getCurrentUser() {
  return localStorage.getItem(CURRENT_USER_KEY);
}

export function isLoggedIn() {
  return !!getCurrentUser();
}

export function setClientId(id) {
  localStorage.setItem(CLIENT_ID_KEY, id);
}

export function getClientId() {
  return localStorage.getItem(CLIENT_ID_KEY);
}

export function clearClientId() {
  localStorage.removeItem(CLIENT_ID_KEY);
}