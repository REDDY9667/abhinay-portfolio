# Abhinay Reddy · Portfolio

A static portfolio site. It's plain HTML, CSS and JavaScript, so there's no build step.
Scrolling plays a cinematic sequence: the hero slides into a wooden "Chapter 01" wall, its doors open, and the camera walks through a 3D gallery of exhibits, then the regular page sections follow.

## Structure

```
index.html            home page (the scroll journey, then milestones, FAQ and contact)
skills.html           detailed skills page (served at /skills)
404.html              custom not-found page
vercel.json           clean URLs + headers
assets/
  css/style.css       all styles
  js/config.js        ← YOUR LINKS (GitHub, LinkedIn, demos, profiles)
  js/common.js        shared: smooth scroll, cursor, dust, reveals, FAQ
  js/journey.js       home page: loader, circuit tree, 3D gallery camera
  favicon.svg
  og-image.png        social preview image (1200×630)
  Abhinay_Reddy_Resume.pdf
```

## Update your links

Open `assets/js/config.js` and fill in the empty strings. Any link left as `""` is hidden on the site, so there are never dead buttons.

## Run locally

```bash
npm run dev        # serves at http://localhost:3000
```

Needs Node.js. It uses `serve`, which handles clean URLs like `/skills` the same way Vercel does.

## Deploy to Vercel

**Option A: GitHub (recommended, auto-deploys on every push)**

1. Create a new GitHub repo and push this folder to it.
2. Go to https://vercel.com/new and import the repo.
3. Set Framework Preset to **Other**. Leave the build command and output directory empty.
4. Click **Deploy**.

**Option B: Vercel CLI**

```bash
npm i -g vercel
vercel          # first deploy (preview)
vercel --prod   # production
```

To get a nicer URL, rename the project in Vercel → Settings → General (for example `abhinayreddy.vercel.app`), or add a custom domain.
