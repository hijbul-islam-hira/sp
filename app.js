const STORAGE_KEY = "supplymate-static-state";
const defaultProducts = [
  { id: 1, name: "Linen Everyday Tote", category: "Accessories", price: 18, stock: 42, seller: "Northstar Goods", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85" },
  { id: 2, name: "Ceramic Travel Mug", category: "Home & living", price: 12, stock: 68, seller: "Clay & Co.", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=85" },
  { id: 3, name: "Daily Ritual Journal", category: "Stationery", price: 9, stock: 120, seller: "Paper Lane", image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=85" }
];

let state = loadState();
let authMode = "signup";
let selectedRole = "reseller";

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const initial = saved ? JSON.parse(saved) : { account: null, products: defaultProducts, orders: [], accounts: [] };
  initial.products = initial.products || defaultProducts;
  initial.orders = initial.orders || [];
  initial.accounts = (initial.accounts || []).map(account => ({ ...account, wallet: typeof account.wallet === "number" ? account.wallet : account.role === "reseller" ? 250 : 0 }));
  return initial;
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function money(value) { return `$${Number(value).toFixed(2)}`; }
function currentUser() { return state.accounts.find(account => account.email === state.account?.email); }
function currentWallet() { return currentUser()?.wallet ?? 0; }
function addWallet(email, amount) { const account = state.accounts.find(item => item.email === email); if (account) account.wallet = Number(account.wallet || 0) + amount; }
function showToast(message) { const toast = document.querySelector("#toast"); toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 2400); }
function currentRole() { return state.account?.role || null; }
function isLoggedIn() { return Boolean(state.account); }

function navigate(route) {
  if (["catalog", "orders", "profile"].includes(route) && !isLoggedIn()) { openAuth("login"); showToast("Please log in to open your workspace."); return; }
  document.querySelectorAll(".view").forEach(view => view.classList.remove("active-view"));
  document.querySelector(`#${route}-view`).classList.add("active-view");
  if (route === "catalog") renderCatalog();
  if (route === "orders") renderOrders();
  if (route === "profile") renderProfile();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function openAuth(mode = "signup", role = "reseller") { authMode = mode; selectedRole = role; document.querySelector("#auth-modal").classList.remove("hidden"); updateAuthModal(); }
function closeModals() { document.querySelectorAll(".modal-backdrop").forEach(modal => modal.classList.add("hidden")); }
function updateAuthModal() {
  const signup = authMode === "signup";
  document.querySelector("#auth-title").textContent = signup ? "Create your workspace." : "Welcome back to SupplyMate.";
  document.querySelector("#auth-copy").textContent = signup ? "Choose your role and start exploring the demo platform." : "Log in with the local demo account you created.";
  document.querySelector("#name-field").classList.toggle("hidden", !signup);
  document.querySelectorAll("[data-auth-mode]").forEach(button => button.classList.toggle("selected", button.dataset.authMode === authMode));
  document.querySelectorAll("[data-role-choice]").forEach(button => button.classList.toggle("selected", button.dataset.roleChoice === selectedRole));
}
function handleAuth(event) {
  event.preventDefault();
  const name = document.querySelector("#name-input").value.trim();
  const email = document.querySelector("#email-input").value.trim().toLowerCase();
  const password = document.querySelector("#password-input").value;
  if (authMode === "signup") {
    if (name.length < 2 || password.length < 6) return showToast("Use a name and password with at least 6 characters.");
    if (state.accounts.some(account => account.email === email)) return showToast("An account with this email already exists.");
    const account = { name, email, password, role: selectedRole, wallet: selectedRole === "reseller" ? 250 : 0 };
    state.accounts.push(account); state.account = { name, email, role: selectedRole }; saveState(); closeModals(); refreshShell(); navigate(selectedRole === "reseller" ? "catalog" : "orders"); showToast(`Welcome, ${name}. Your ${selectedRole} workspace is ready.`);
  } else {
    const account = state.accounts.find(item => item.email === email && item.password === password);
    if (!account) return showToast("Email or password does not match a local account.");
    state.account = { name: account.name, email: account.email, role: account.role }; saveState(); closeModals(); refreshShell(); navigate(account.role === "reseller" ? "catalog" : "orders"); showToast("You are logged in.");
  }
}