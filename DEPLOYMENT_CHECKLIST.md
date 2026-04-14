# Deployment Checklist

## Before Deploying

### 1. Install Dependencies ✓
```bash
npm install
```
This installs all required packages including:
- Tailwind CSS
- PostCSS
- Autoprefixer
- Compression

### 2. Build Tailwind CSS ✓
```bash
npm run build:css
```
This generates `static/css/output.css` - **CRITICAL for styling**

If you skip this step, the website will have no styles!

### 3. Verify Key Files ✓
- ✅ `static/css/output.css` exists (generated)
- ✅ `static/css/input.css` exists (source)
- ✅ `static/js/api.js` has no syntax errors
- ✅ `static/js/performance.js` uses supported APIs

### 4. Start Server ✓
```bash
npm start
```

### 5. Test in Browser ✓
- Open `http://localhost:5000`
- Check landing page loads with styles
- Check mobile menu works
- Check dark mode works
- Test a few API calls

## Common Issues & Solutions

### No styles showing up?
→ Run `npm run build:css` again
→ Hard refresh browser (Ctrl+Shift+R)
→ Check that `output.css` file exists

### JavaScript errors in console?
→ Check browser console for errors
→ Verify `static/js/*.js` files load correctly
→ May need to rebuild if you modified any HTML

### Performance warnings?
→ These are normal during development
→ Run Lighthouse audit in DevTools

## What's New

| Component | Before | After |
|-----------|--------|-------|
| Tailwind | CDN (slow) | Local build (fast) |
| API Errors | Syntax errors | Fixed ✓ |
| Performance | Warnings | Fixed ✓ |
| CSS | Inline + CDN | Compiled + optimized |

## Production Deployment Process

1. **Prepare Local**
   ```bash
   npm install
   npm run build:css
   npm start
   # Test at http://localhost:5000
   ```

2. **Push to Server**
   ```bash
   # Option A: Using git
   git add .
   git commit -m "Production build ready"
   git push origin main
   
   # Option B: Manual upload
   # Upload all files to server
   ```

3. **Deploy on Server**
   ```bash
   cd /path/to/project
   npm install
   npm run build:css
   pm2 start server.js --name "virtual-campus"  # Or: npm start
   ```

4. **Verify**
   - Check https://yourapp.com loads with styles
   - Run Lighthouse audit
   - Monitor server logs for errors

## Environment Variables

For production, ensure these are set in `.env`:
```
NODE_ENV=production
DATABASE_URI=mongodb+srv://...
PORT=5000
```

## Files to Commit to Git

```
✅ Do commit:
  - tailwind.config.js
  - postcss.config.js
  - static/css/input.css
  - package.json
  - SETUP.md
  - ISSUES_FIXED.md
  - .gitignore

❌ Do NOT commit:
  - static/css/output.css (generated)
  - node_modules/
  - .env (use .env.example instead)
```

## Quick Commands Reference

```bash
# Development
npm run build:css:watch    # Watch for CSS changes (auto-rebuild)
npm run dev                # Start dev server with nodemon

# Production  
npm run build:css          # Build CSS once
npm start                  # Start server

# Troubleshooting
npm run build              # Build directory structure
npm install                # Reinstall dependencies
```

## Support

If styles don't appear after following this checklist:
1. Delete `node_modules` folder
2. Run `npm install` again
3. Run `npm run build:css`
4. Restart server with `npm start`

See `SETUP.md` for detailed setup instructions.
