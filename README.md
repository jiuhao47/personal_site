# Junyan Jiang — Personal Homepage

A typography-led academic homepage built with Astro and deployed on GitHub Pages.

## Local development

```bash
npm install
npm run dev
```

The development server is available at `http://localhost:4321/personal_site/`.

## Content

Personal information, news, publications, education, and honors are maintained in
`src/data/site.ts`. The page layout lives in `src/pages/index.astro`, and the visual
system is defined in `src/styles/global.css`.

## Appearance

The site supports system, light, and dark modes. Theme preferences are stored locally
in the visitor's browser.

## Deployment

Push to `main` to run the GitHub Pages workflow. The generated site is published to
the existing `gh-pages` branch.
