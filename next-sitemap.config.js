/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://michaeldemar.co',
  generateRobotsTxt: false, // We already have a custom robots.txt
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 7000,
  exclude: ['/api/*', '/_next/*', '/static/*', '/404', '/500'],
  generateIndexSitemap: false,
}
