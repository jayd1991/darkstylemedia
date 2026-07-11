import { defineConfig } from 'astro/config';

export default defineConfig({
  // Set to your GitHub Pages URL:
  //   username.github.io repo  →  'https://YOUR-USERNAME.github.io'
  //   project repo             →  'https://YOUR-USERNAME.github.io/darkstylemedia'
  //   custom domain            →  'https://darkstylemedia.com'
  site: 'https://darkstylemedia.github.io',

  // Uncomment if repo is NOT named "YOUR-USERNAME.github.io":
  // base: '/darkstylemedia',

  output: 'static',
});
