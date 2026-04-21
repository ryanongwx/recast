# 🚀 Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_ELEVENLABS_API_KEY`
   - `VITE_OPENAI_API_KEY`
4. Deploy automatically on every push

### Option 2: Netlify
1. Build the project: `npm run build`
2. Drag the `dist` folder to Netlify
3. Set up environment variables in Netlify dashboard
4. Configure redirects for SPA routing

### Option 3: GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json:
   ```json
   "homepage": "https://yourusername.github.io/recast-vibe-translator",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. Run: `npm run deploy`

## Environment Variables

Make sure to set these in your deployment platform:

```
VITE_ELEVENLABS_API_KEY=your_actual_elevenlabs_key
VITE_OPENAI_API_KEY=your_actual_openai_key
```

## Build Command
```bash
npm run build
```

## Output Directory
```
dist/
```

## Node Version
```
18.x or higher
```

## Domain Setup

For custom domains:
1. Add CNAME record pointing to your deployment platform
2. Configure SSL certificate
3. Update any hardcoded URLs in the app

## Performance Optimization

- Enable gzip compression
- Set up CDN for static assets
- Configure caching headers
- Monitor Core Web Vitals

## Security Considerations

- Never expose API keys in client-side code
- Use environment variables for all secrets
- Enable HTTPS only
- Set up proper CORS headers

## Monitoring

- Set up error tracking (Sentry)
- Monitor API usage and costs
- Track user engagement metrics
- Set up uptime monitoring