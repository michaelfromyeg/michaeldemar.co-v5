# Properly Configuring robots.txt for Next.js 15
`2024-12-31 22:45:28`

_Prompt_:
Where do I put a robots.txt on my site? Where should I add it to prevent LLMs or other bots from scraping?

_Claude_:
Let me help you add a robots.txt file to your Next.js 15 project to manage bot access.

_Prompt_:
How do I create sitemap.xml automatically?

_Claude_:
For Next.js 15, I recommend using next-sitemap - it's a robust solution that automatically generates both sitemap.xml and robots.txt based on your pages. Let me help you set this up.

First, let's install the package:

```bash
npm install next-sitemap
```

Now, let's create a configuration file. I'll create next-sitemap.config.js in your project root:

