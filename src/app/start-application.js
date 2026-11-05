export function startApplication({ features }) {
  features.forEach((feature) => feature.start());
  if ('serviceWorker' in navigator) navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL });
}
