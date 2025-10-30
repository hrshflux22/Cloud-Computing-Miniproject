# Deploy to Netlify with HTTPS (Free)

Netlify provides free HTTPS, custom domains, and automatic deployments.

## Method 1: Drag and Drop (Easiest - 2 minutes)

### Step 1: Sign Up
1. Go to https://netlify.com
2. Click **Sign up** (use GitHub, GitLab, or email)

### Step 2: Deploy
1. After login, you'll see "Sites" page
2. Look for the drag & drop area that says "Want to deploy a new site without connecting to Git?"
3. **Drag your entire `build` folder** into this area
4. Wait 10-30 seconds for deployment

### Step 3: Get Your URL
- Netlify assigns you a URL like: `https://random-name-123456.netlify.app`
- **This URL has HTTPS automatically!** 🔒
- Click **Site settings** → **Change site name** to customize

✅ **Done!** Your site is now secure with HTTPS.

---

## Method 2: Using Netlify CLI

### Step 1: Install Netlify CLI
```powershell
npm install -g netlify-cli
```

### Step 2: Login
```powershell
netlify login
```
This opens a browser window to authenticate.

### Step 3: Deploy
```powershell
# From your project directory
cd "C:\Users\tanwa\Downloads\Employee Management System (Community)"

# Deploy to production
netlify deploy --prod --dir=build
```

### Step 4: Get Your URL
The CLI will show your site URL: `https://your-site.netlify.app`

---

## Method 3: Continuous Deployment (Automatic Updates)

### Step 1: Push to GitHub
If your code isn't on GitHub yet:

```powershell
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### Step 2: Connect to Netlify
1. Go to https://app.netlify.com
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub**
4. Select your repository
5. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
6. Click **Deploy site**

### Step 3: Automatic Updates
Now whenever you push to GitHub:
- Netlify automatically rebuilds and deploys
- No manual uploads needed!

---

## Custom Domain (Optional)

### Free Netlify Subdomain
- Go to **Site settings** → **Domain management**
- Click **Change site name**
- Choose any available name: `your-app-name.netlify.app`

### Your Own Domain
If you own a domain:
1. Go to **Domain management** → **Add custom domain**
2. Follow DNS setup instructions
3. Netlify provides free SSL certificate automatically

---

## Environment Variables

If you use environment variables (like EmailJS):

1. Go to **Site settings** → **Environment variables**
2. Add your variables:
   - `VITE_EMAILJS_SERVICE_ID`
   - `VITE_EMAILJS_TEMPLATE_ID`
   - `VITE_EMAILJS_PUBLIC_KEY`
3. Redeploy

---

## Redirect Rules for React Router

Netlify automatically handles React Router, but to be explicit:

Create `public/_redirects` file with:
```
/* /index.html 200
```

Or create `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Comparison: S3 vs Netlify

| Feature | AWS S3 (Academy) | Netlify |
|---------|------------------|---------|
| HTTPS | ❌ No | ✅ Yes (Free) |
| Custom Domain | ❌ Limited | ✅ Yes (Free) |
| SSL Certificate | ❌ No | ✅ Auto (Free) |
| Deployment | Manual | Drag & Drop / Auto |
| Cost | Free | Free (100GB/month) |
| Speed | Good | Excellent (CDN) |

---

## Benefits of Netlify

✅ **Free HTTPS** - Automatic SSL certificates
✅ **Fast CDN** - Global content delivery
✅ **Easy deployment** - Drag & drop or Git
✅ **Custom domains** - Free subdomain or use your own
✅ **Automatic builds** - Connect to GitHub for CI/CD
✅ **Instant rollbacks** - Easy to revert deployments
✅ **Form handling** - Built-in form submissions
✅ **Analytics** - See visitor stats (paid tier)

---

## Quick Start Commands

```powershell
# Build your app
npm run build

# Install Netlify CLI (one time)
npm install -g netlify-cli

# Login (one time)
netlify login

# Deploy
netlify deploy --prod --dir=build

# Or for manual drag & drop:
# Just go to https://app.netlify.com/drop and drag the 'build' folder
```

---

## Troubleshooting

### Issue: "Page Not Found" on routes
- Add `_redirects` file or `netlify.toml` (see above)

### Issue: Environment variables not working
- Add them in Netlify dashboard under Site settings
- Redeploy after adding

### Issue: Build fails
- Check build command is `npm run build`
- Check publish directory is `build`
- Verify all dependencies in `package.json`

---

## Your Site URL

After deployment, you'll get:
- **Production URL**: `https://your-site-name.netlify.app` 🔒
- **Preview URLs**: For each deploy
- **Admin panel**: `https://app.netlify.com`

🎉 **Secure deployment complete!**
