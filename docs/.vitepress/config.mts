import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'aockit',
  description: 'Polyglot Advent of Code CLI',
  base: '/aockit/',
  markdown: {
    theme: 'rose-pine-moon'
  },
  themeConfig: {
    footer: {
      message: 'Released under the MIT License.',
      copyright: `Copyright © ${new Date().getFullYear()} taskylizard.`
    },
    sidebar: [
      {
        text: 'Getting Started',
        link: '/getting-started'
      },
      {
        text: 'JavaScript Support',
        link: '/javascript'
      },
      {
        text: 'Language Support',
        link: '/language-support'
      },
      {
        text: 'Templates',
        link: '/templates'
      }
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/aockit/aockit' }]
  }
})
