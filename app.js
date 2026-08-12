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