# Deployment Guide

This guide covers multiple deployment options for your data visualization portfolio.

## Quick Start (Local)

```bash
# Option 1: Using Python
python -m http.server 8000

# Option 2: Using Node.js
npx serve . -p 8000

# Option 3: Using npm script
npm start
```

Visit `http://localhost:8000/portfolio.html`

## GitHub Pages Deployment

### Method 1: Manual Setup

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Data Visualization Portfolio"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/data-viz-portfolio.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings
   - Navigate to "Pages" section
   - Source: Deploy from branch
   - Branch: `main`
   - Folder: `/ (root)`
   - Click Save

3. **Access Your Portfolio**
   - URL: `https://YOUR-USERNAME.github.io/data-viz-portfolio/portfolio.html`
   - Set this as your main page by renaming `portfolio.html` to `index.html` (optional)

### Method 2: GitHub Actions (Automated)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
          publish_branch: gh-pages
```

## Vercel Deployment

### Quick Deploy

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow prompts:**
   - Set up and deploy: Yes
   - Which scope: Your account
   - Link to existing project: No
   - Project name: data-viz-portfolio
   - Directory: ./
   - Override settings: No

### Vercel Configuration

Create `vercel.json`:

```json
{
  "version": 2,
  "name": "data-viz-portfolio",
  "builds": [
    {
      "src": "*.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/",
      "dest": "/portfolio.html"
    }
  ]
}
```

## Netlify Deployment

### Drag & Drop

1. Go to [netlify.com](https://netlify.com)
2. Drag your project folder to the deploy zone
3. Done! Your site is live

### Git Integration

1. **Connect Repository**
   - New site from Git
   - Choose GitHub/GitLab/Bitbucket
   - Select your repository

2. **Build Settings**
   - Build command: (leave empty)
   - Publish directory: `./`

3. **Deploy Settings**
   - Branch: `main`
   - Auto-deploy: Enabled

### Netlify Configuration

Create `netlify.toml`:

```toml
[build]
  publish = "."
  command = ""

[[redirects]]
  from = "/"
  to = "/portfolio.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

## Custom Domain Setup

### GitHub Pages

1. Add `CNAME` file with your domain:
   ```
   yourdomain.com
   ```

2. Configure DNS:
   - Type: A
   - Name: @
   - Value: GitHub Pages IPs
   - Or CNAME: YOUR-USERNAME.github.io

### Vercel

```bash
vercel domains add yourdomain.com
```

Follow DNS configuration instructions

### Netlify

1. Domain settings → Add custom domain
2. Configure DNS records as instructed

## Performance Optimization

### Pre-deployment Checklist

- [ ] Minify JavaScript (optional, affects readability)
- [ ] Optimize images (convert to WebP if needed)
- [ ] Add meta tags for SEO
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Verify all links work
- [ ] Check console for errors

### CDN & Caching

Add cache headers in `netlify.toml` or `.htaccess`:

```
# Cache static assets for 1 year
Cache-Control: public, max-age=31536000, immutable
```

## SSL/HTTPS

All platforms (GitHub Pages, Vercel, Netlify) provide free SSL certificates automatically.

## Analytics Integration

### Google Analytics

Add to `<head>` of all HTML files:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Plausible (Privacy-friendly alternative)

```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

## Monitoring

### Uptime Monitoring

- [UptimeRobot](https://uptimerobot.com) (Free)
- [Pingdom](https://www.pingdom.com)
- [StatusCake](https://www.statuscake.com)

### Performance Monitoring

- [Google Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org)
- [GTmetrix](https://gtmetrix.com)

## Troubleshooting

### Common Issues

**Issue**: 404 on GitHub Pages
- **Solution**: Check that files are in root or docs folder
- **Solution**: Verify branch and folder settings in Pages configuration

**Issue**: Styles not loading
- **Solution**: Use relative paths (`./styles.css` not `/styles.css`)
- **Solution**: Check case sensitivity (Linux servers are case-sensitive)

**Issue**: JavaScript not executing
- **Solution**: Open browser console to check for errors
- **Solution**: Verify all script src paths are correct

**Issue**: Slow loading
- **Solution**: Optimize images and assets
- **Solution**: Use browser caching
- **Solution**: Consider lazy loading for heavy visualizations

## Security Checklist

- [ ] No sensitive data in repository
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] No API keys in client-side code
- [ ] Content Security Policy (optional)

## Backup Strategy

```bash
# Backup to archive
tar -czf portfolio-backup-$(date +%Y%m%d).tar.gz .

# Or use Git tags for versions
git tag -a v1.0 -m "Version 1.0 - Initial portfolio"
git push origin v1.0
```

## Continuous Deployment

All three platforms support automatic deployment:

- **Push to main branch** → Auto-deploy
- **Pull request** → Preview deployment (Vercel/Netlify)
- **Production branch** → Production deployment

## Cost Breakdown

| Platform | Free Tier | Paid Plans |
|----------|-----------|------------|
| GitHub Pages | ✅ Unlimited public repos | N/A |
| Vercel | ✅ 100GB bandwidth/month | $20/month for Pro |
| Netlify | ✅ 100GB bandwidth/month | $19/month for Pro |

**Recommendation**: Start with GitHub Pages (free, simple), upgrade to Vercel/Netlify if you need custom domains, better analytics, or preview deployments.

## Post-Deployment

1. **Test everything**
   - Click every link
   - Test every visualization
   - Verify on mobile

2. **Share your portfolio**
   - Add to LinkedIn
   - Share on Twitter/social media
   - Include in resume/applications

3. **Monitor performance**
   - Set up analytics
   - Check loading times
   - Monitor error rates

4. **Iterate**
   - Gather feedback
   - Add new visualizations
   - Improve based on user interactions

---

**You're live! 🚀**

Your data visualization portfolio is now accessible to the world. Share it proudly!
