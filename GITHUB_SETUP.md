# GitHub Setup Instructions

## Step 1: Create Repository on GitHub
1. Go to https://github.com/new
2. Repository name: `culture-shopify-theme` (or your choice)
3. Description: "Luxury wellness Shopify theme for CULTURE kombucha brand"
4. Choose Public or Private
5. **DO NOT** check "Initialize with README"
6. Click "Create repository"

## Step 2: Connect and Push
After creating the repo, GitHub will show you commands. Use these:

```bash
cd /Users/amirhangchenrai/Desktop/Kombucha

# Add your GitHub repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/culture-shopify-theme.git

# Push to GitHub
git push -u origin main
```

## Alternative: Using SSH (if you have SSH keys set up)
```bash
git remote add origin git@github.com:YOUR_USERNAME/culture-shopify-theme.git
git push -u origin main
```

## Quick Commands Reference
```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push

# Pull from GitHub
git pull
```

