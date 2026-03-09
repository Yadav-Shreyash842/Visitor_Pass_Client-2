# Visitor Pass Management System - Frontend Deployment Guide

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for React/Vite)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Environment Variables:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add: `VITE_API_URL` = `your-backend-url`

### Option 2: Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Environment Variables:**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add: `VITE_API_URL` = `your-backend-url`

### Option 3: GitHub Pages (Static Hosting)

1. **Update `vite.config.js`:**
   ```javascript
   export default defineConfig({
     plugins: [react()],
     base: '/Visitor_Pass_Client/'
   })
   ```

2. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Add to `package.json` scripts:**
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

### Option 4: AWS S3 + CloudFront

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload to S3:**
   - Create S3 bucket
   - Enable static website hosting
   - Upload `dist` folder contents

3. **Configure CloudFront:**
   - Create distribution pointing to S3 bucket
   - Set environment variables

## 📋 Pre-Deployment Checklist

- [ ] Update `.env` with production API URL
- [ ] Test build locally: `npm run build && npm run preview`
- [ ] Ensure all dependencies are in `package.json`
- [ ] Configure CORS on backend to allow frontend domain
- [ ] Set up environment variables on hosting platform
- [ ] Test all features after deployment

## 🔧 Environment Variables Required

```env
VITE_API_URL=https://your-backend-api.com/api
```

## 🌐 Backend Deployment

Your backend (Node.js/Express) should be deployed separately:
- **Recommended:** Render, Railway, Heroku, or AWS EC2
- **Update:** MongoDB connection string in backend `.env`
- **Enable:** CORS for your frontend domain

## 📝 Important Notes

1. **CORS Configuration:**
   In your backend `server.js`, update CORS to allow your frontend URL:
   ```javascript
   app.use(cors({
     origin: 'https://your-frontend-url.com'
   }))
   ```

2. **API URL:**
   Make sure `VITE_API_URL` in frontend `.env` points to deployed backend

3. **Build Output:**
   The `dist` folder contains the production build (deploy this folder)

## 🎯 Quick Deploy Commands

```bash
# Build for production
npm run build

# Test production build locally
npm run preview

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

## 📱 Post-Deployment Testing

Test these features:
- [ ] User registration and login
- [ ] Visitor registration
- [ ] Dashboard loads correctly
- [ ] QR code generation
- [ ] Camera/QR scanner works
- [ ] Pass approval/rejection
- [ ] Email notifications
- [ ] Profile updates

## 🆘 Troubleshooting

**Problem:** API calls failing
- **Solution:** Check CORS settings and API URL in environment variables

**Problem:** Blank page after deployment
- **Solution:** Check browser console, ensure `base` in `vite.config.js` matches

**Problem:** Camera not working
- **Solution:** Ensure site is served over HTTPS (required for camera access)

**Problem:** Environment variables not working
- **Solution:** Rebuild after changing env vars (Vite embeds them at build time)
