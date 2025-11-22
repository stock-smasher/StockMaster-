---
description: How to share this project on GitHub and add a collaborator
---

# Share Project on GitHub

Follow these steps to upload your code to GitHub and invite your friend.

## 1. Create a GitHub Repository
1.  Go to [github.com/new](https://github.com/new).
2.  Enter a **Repository name** (e.g., `stock-master`).
3.  Choose **Public** or **Private**.
4.  **Do not** check "Initialize with README", "Add .gitignore", or "Add a license" (since we already have code).
5.  Click **Create repository**.

## 2. Push Your Code
Copy the commands from the "…or push an existing repository from the command line" section on GitHub, or run these commands in your terminal (replace `YOUR_USERNAME` with your GitHub username):

```bash
# Stage all changes
git add .

# Commit changes
git commit -m "Initial commit of StockMaster with PostgreSQL"

# Link to GitHub (ONLY RUN THIS IF YOU HAVEN'T LINKED IT YET)
# Replace URL with your actual repository URL
git remote add origin https://github.com/YOUR_USERNAME/stock-master.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

## 3. Add Collaborator
1.  Go to your repository page on GitHub.
2.  Click **Settings** (top tab).
3.  Click **Collaborators** (left sidebar).
4.  Click **Add people**.
5.  Enter your friend's GitHub username or email.
6.  Select them and click **Add to this repository**.
7.  Send the invite link to your friend (or tell them to check their email).

## 4. Friend's Setup
Your friend needs to:
1.  Accept the invite.
2.  Clone the repo: `git clone https://github.com/YOUR_USERNAME/stock-master.git`
3.  Create their own `.env` file in `server/` (share your `.env` content with them securely).
4.  Run `npm install` in both `client` and `server` folders.
5.  Run `npm run dev` in both folders.
