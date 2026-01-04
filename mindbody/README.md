BodyMind App — Vite + React

## Getting Started

Development:

```bash
npm install
npm run dev
```

The dev server runs at http://localhost:5173 by default.

Build for production:

```bash
npm run build
npm run preview
```

Notes:
- The app entry is `src/main.tsx` and routes live in `src/App.tsx` using `react-router-dom`.
- Styles and static assets are in `src/` and `public/` respectively.

GitHub Pages
- The project is configured to deploy to GitHub Pages under `/mindbody/`.
- Vite `base` is set to `/mindbody/` and the build outputs to `docs/mindbody` (see `vite.config.ts`).
- A GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) will build the app on push to `main` and publish the `docs/` folder to GitHub Pages.

Routing
- The app uses `HashRouter` so client-side routing works correctly on GitHub Pages without server configuration.

If you'd like, I can also:
- Add an npm script to copy a local build into `docs/` for local preview.
- Add a `404.html` fallback or set up a `CNAME` for a custom domain.
- Add a lightweight smoke-test workflow that runs after deploy to validate site links.

Tell me which of those you'd like me to implement next.
