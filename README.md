# boring-finance-app

## Run locally

The dashboard is a Vite-powered, browser-only JavaScript PWA.

From the project root, install dependencies and start the development server (requires Node.js 20+):

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite (normally [http://localhost:5173](http://localhost:5173)) in your browser.

Using a local server (rather than double-clicking `index.html`) lets the service worker register, so you can test the offline/PWA behaviour as well. Press `Ctrl+C` in the terminal to stop the server.

Create a production build with `npm run build`; the deployable static files are written to `dist/`.

The dashboard stores its figures in the connected Upstash Redis datastore. On first use on a device, enter the `DASHBOARD_ACCESS_KEY` configured in Vercel; the browser retains it locally for later visits. It also keeps a device-local backup if the datastore is temporarily unavailable.

## Architecture

The browser is organised by feature rather than by one global script. `src/core/` contains small, stable cross-feature utilities; `src/app/` composes enabled features; and each feature owns its domain calculations, application controller, browser infrastructure, and presentation bindings. The existing house-savings feature lives at `src/features/house-savings/`; future Zakat and expenses features can follow the same shape without changing it.

The server follows the same boundary: `api/values.js` remains the HTTP adapter and public contract, `api/features/house-savings/` contains the feature rules, and `api/infrastructure/` contains the Upstash adapter. A future account or shared-goal implementation can replace the fixed dashboard identifier with an authorised user or goal identifier without changing the browser contract.

## Deployment

### 1. Push to GitHub

Create an empty GitHub repository, then run these commands from the project root (replace the URL with yours):

```powershell
git init
git add .
git commit -m "Initial house savings dashboard"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

### 2. Deploy with Vercel (recommended)

In the Vercel dashboard, choose **Add New → Project** and import the GitHub repository. Vercel detects Vite, uses `npm run build`, and publishes `dist`. Every pull request receives a preview deployment and pushes to `main` update production.

### Alternative: GitHub Pages

This repository includes `.github/workflows/deploy-pages.yml`. In GitHub, open **Settings → Pages**, choose **GitHub Actions** as the source, then push to `main`. The workflow builds the Vite app with the repository sub-path and deploys `dist`.
