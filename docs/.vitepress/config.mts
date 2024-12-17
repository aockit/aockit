import { defineConfig } from 'vitepress'
import { version as aocjsVersion } from '../../packages/aocjs/package.json'
import { version as aockitVersion } from '../../packages/cli/package.json'

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
        text: `aockit@${aockitVersion}`,
        base: '/kit/',
        collapsed: false,
        rel: '/kit/',
        items: [
          {
            text: 'Getting Started',
            link: '/getting-started'
          },
          {
            text: 'TypeScript Support',
            link: '/typescript'
          },
          {
            text: 'Other Language Support',
            link: '/language-support'
          },
          {
            text: 'Templates',
            link: '/templates'
          },
          {
            text: 'Tasks API',
            link: '/tasks'
          }
        ]
      },
      {
        text: `aocjs@${aocjsVersion}`,
        base: '/aocjs/',
        collapsed: false,
        items: [
          {
            text: 'Getting Started',
            link: '/getting-started'
          }
        ]
      }
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/aockit/aockit' }]
  }
})
