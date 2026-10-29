# Manansh Gupta — Portfolio

Personal portfolio for **Manansh Gupta** — Software Engineering Student, Full Stack Developer, and DSA Enthusiast at Galgotias University.

Built with **React 19**, **Vite**, and **Tailwind CSS v4**, engineered for high performance, accessibility, and visual excellence.

## Features & Architecture

- **Flagship Project Showcase**: Visual presentation of *Avant AI Fashion Platform* and *HR Management Dashboard*.
- **Interactive Shaders & Physics**:
  - Custom WebGL Dither shader on Hero and Contact sections.
  - Interactive FaultyTerminal shader for the Skills/Toolbox section.
  - Custom fluid physics loop on the CurvedLoop ticker.
  - Cursor glow, magnetic buttons, element inspector easter egg, and spotlight cards.
- **Embedded Portfolio Shell**: Interactive terminal reachable via `` ` `` or `Ctrl/Cmd + K`. Supports natural language queries, project lookups, and games.
- **Verified Credentials**: Showcases 480+ solved DSA problems, 1500+ LeetCode rating, Smart India Hackathon achievement, and Oracle & EF SET certifications.
- **Accessible & Performant**: Full keyboard navigation, screen reader labels, responsive layouts, and automatic adaptation for `prefers-reduced-motion`.

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Production build
npm run build

# 4. Preview production build
npm run preview
```

## Adding Your Links & Data

All profile information, project details, internship history, and social profile links live in a single centralized file:
- **`src/data.js`**

To add your personal profile URLs, update the `socialLinks` object:
```javascript
export const socialLinks = {
  github: "https://github.com/your-username",
  linkedin: "https://linkedin.com/in/your-username",
  leetcode: "https://leetcode.com/u/your-username",
  codolio: "https://codolio.com/profile/your-username",
};
```

Resume file is served from `public/main_resume.pdf`. Profile photos are in `public/images/`.

## Deploying to Vercel

1. Push your repository to GitHub.
2. Import the project into Vercel.
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Click **Deploy**.
