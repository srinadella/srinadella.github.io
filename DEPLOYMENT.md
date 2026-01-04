# GitHub Pages Deployment (Repository-wide)

This repository serves a static personal site (root `index.html`) and a Vite/React app under `mindbody/`.

What I configured:
- The Mindbody app (`/mindbody`) is configured with `base: "/mindbody/"` in `mindbody/vite.config.ts`.
- The Mindbody build outputs to `docs/mindbody` so GitHub Pages can serve it from the `docs/` folder.
- `HashRouter` is used in `mindbody/src/main.tsx` to make client-side routing compatible with GitHub Pages.
- A GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) builds the app on push to `main` and deploys `docs/` to GitHub Pages.

How to test locally:
1. Run the root site locally (open `index.html` in a browser) and click the **Mindbody App** link — it should point to `/mindbody/`.
2. Run the Mindbody dev server at `mindbody/`:
   - cd mindbody
   - npm install
   - npm run dev
3. To build the Mindbody app locally into `docs/`:
   - cd mindbody
   - npm run build
   - The production files will be available in `docs/mindbody`

Site URL
- The site will be available at: https://srinadella.github.io

CI Badges
- [![Pages smoke test](https://github.com/srinadella/srinadella.github.io/actions/workflows/pages-smoketest.yml/badge.svg)](https://github.com/srinadella/srinadella.github.io/actions/workflows/pages-smoketest.yml)
- [![Scheduled link check](https://github.com/srinadella/srinadella.github.io/actions/workflows/pages-scheduled-check.yml/badge.svg)](https://github.com/srinadella/srinadella.github.io/actions/workflows/pages-scheduled-check.yml)

Next steps (optional):
- Add a smoke-test workflow that validates the deployed site and internal links after Pages deploy.
- Add a `CNAME` file to `docs/` if you have a custom domain.
- If you'd prefer to deploy to a `gh-pages` branch instead of `docs/`, I can switch the workflow to use `peaceiris/actions-gh-pages`.
