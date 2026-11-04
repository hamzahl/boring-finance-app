import './styles.css';

// All savings data stays in the browser; no account data is sent anywhere.
const STORAGE_KEY = 'keys-to-home-v1';
const ACCOUNT_IDS = ['starling', 'savings', 'htb', 'lisa'];
const INPUT_IDS = ['goal', ...ACCOUNT_IDS];
const currency = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
const element = (id) => document.getElementById(id);

function readAmount(id) { return Math.max(0, Number.parseFloat(element(id).value) || 0); }
function calculateSavings() {
  const goal = readAmount('goal');
  const total = ACCOUNT_IDS.reduce((sum, id) => sum + readAmount(id), 0);
  return { goal, total, progress: goal === 0 ? 0 : Math.min((total / goal) * 100, 100), remaining: Math.max(goal - total, 0) };
}
function renderSummary() {
  const { goal, total, progress, remaining } = calculateSavings();
  const goalReached = goal > 0 && total >= goal;
  element('goalDisplay').textContent = currency.format(goal); element('totalDisplay').textContent = currency.format(total);
  const roundedProgress = Math.round(progress);
  element('progressFill').style.width = `${progress}%`; element('progressBar').setAttribute('aria-valuenow', roundedProgress); element('progressBar').setAttribute('aria-valuetext', `${roundedProgress}% towards your savings goal`); element('percent').textContent = `${roundedProgress}% there`;
  element('remaining').textContent = goalReached ? 'Goal smashed! 🎉' : `${currency.format(remaining)} to go`;
  element('encouragement').textContent = goalReached ? 'You did it — time to celebrate that key moment.' : 'Every little bit is a brick in your future home.';
  element('setupPrompt').hidden = goal > 0 || total > 0;
}
function loadSavedValues() { try { const values = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); INPUT_IDS.forEach((id) => { element(id).value = values[id] ?? ''; }); } catch { /* Ignore malformed previous data. */ } }
function saveValues() { const values = Object.fromEntries(INPUT_IDS.map((id) => [id, element(id).value])); localStorage.setItem(STORAGE_KEY, JSON.stringify(values)); const savedAt = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit' }).format(new Date()); element('saveState').setAttribute('aria-live', 'polite'); element('saveState').textContent = `Saved at ${savedAt} — on this device.`; }
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL });
  }
}
loadSavedValues(); renderSummary(); INPUT_IDS.forEach((id) => element(id).addEventListener('input', () => { renderSummary(); element('saveState').setAttribute('aria-live', 'off'); element('saveState').textContent = 'Preview updated. Save to keep these figures on this device.'; })); element('savingsForm').addEventListener('submit', (event) => { event.preventDefault(); saveValues(); }); registerServiceWorker();
