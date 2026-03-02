# OAuth Setup Guide for Disease Prediction App

## 🔐 Security Alert
**IMPORTANT**: Your current OAuth credentials in `.env` have been exposed and should be regenerated immediately.

---

## 📋 Steps to Generate New Google OAuth Credentials

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create or Select a Project
- Click on the project dropdown at the top
- Create a new project or select your existing "Disease Prediction" project

### 3. Enable Google+ API
- Go to **APIs & Services** → **Library**
- Search for "Google+ API" or "Google Identity"
- Click **Enable**

### 4. Configure OAuth Consent Screen
- Go to **APIs & Services** → **OAuth consent screen**
- Choose **External** (for testing) or **Internal** (for organization)
- Fill in the required fields:
  - **App name**: Disease Prediction App
  - **User support email**: Your email
  - **Developer contact**: Your email
- Add scopes:
  - `userinfo.email`
  - `userinfo.profile`
- Add test users if using External type
- Click **Save and Continue**

### 5. Create OAuth 2.0 Credentials
- Go to **APIs & Services** → **Credentials**
- Click **Create Credentials** → **OAuth 2.0 Client ID**
- Choose **Web application**
- Fill in:
  - **Name**: Disease Prediction Web Client
  - **Authorized JavaScript origins**:
    ```
    http://localhost:3000
    https://your-production-domain.com
    ```
  - **Authorized redirect URIs**:
    ```
    http://localhost:3000/api/auth/callback/google
    https://your-production-domain.com/api/auth/callback/google
    ```
- Click **Create**

### 6. Copy Your Credentials
- Copy the **Client ID** and **Client Secret**
- Update your `.env` file:
  ```env
  GOOGLE_CLIENT_ID="your_new_client_id.apps.googleusercontent.com"
  GOOGLE_CLIENT_SECRET="your_new_client_secret"
  ```

---

## 🔧 GitHub OAuth Setup (Optional)

### 1. Go to GitHub Developer Settings
Visit: https://github.com/settings/developers

### 2. Create New OAuth App
- Click **New OAuth App**
- Fill in:
  - **Application name**: Disease Prediction App
  - **Homepage URL**: http://localhost:3000
  - **Authorization callback URL**: http://localhost:3000/api/auth/callback/github

### 3. Generate Client Secret
- After creating, click **Generate a new client secret**
- Copy both Client ID and Client Secret
- Update your `.env` file:
  ```env
  GITHUB_CLIENT_ID="your_github_client_id"
  GITHUB_CLIENT_SECRET="your_github_client_secret"
  ```

---

## ✅ Verify Your Setup

### 1. Check Your `.env` File
Make sure you have:
```env
DATABASE_URL='your_database_url'
GEMINI_API_KEY=your_gemini_key
BETTER_AUTH_SECRET="HSGXlvyoRR1clCT9qBzmmz2qzaxdz1uK2Eni6WtVScQ="
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your_new_google_client_id"
GOOGLE_CLIENT_SECRET="your_new_google_secret"
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
```

### 2. Run Database Migrations
```powershell
npx prisma generate
npx prisma db push
```

### 3. Start Development Server
```powershell
npm run dev
```

### 4. Test Authentication
- Navigate to http://localhost:3000/sign-in
- Try signing in with Google
- Try signing in with GitHub

---

## 🚀 Production Deployment (Vercel)

### Update Redirect URIs
For production, add these URIs to your OAuth apps:
- Google: `https://your-domain.vercel.app/api/auth/callback/google`
- GitHub: `https://your-domain.vercel.app/api/auth/callback/github`

### Set Environment Variables in Vercel
Go to your Vercel project settings and add all environment variables from `.env`

### Update Better Auth URL
```env
BETTER_AUTH_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_BETTER_AUTH_URL="https://your-domain.vercel.app"
```

---

## 🔒 Security Best Practices

1. ✅ **Never commit `.env` to git** (already added to `.gitignore`)
2. ✅ **Rotate secrets regularly**
3. ✅ **Use different credentials for development and production**
4. ✅ **Restrict OAuth redirect URIs to your domains only**
5. ✅ **Enable 2FA on your Google and GitHub accounts**

---

## 🐛 Troubleshooting

### "redirect_uri_mismatch" Error
- Check that your redirect URI exactly matches what's configured in Google Cloud Console
- Make sure to include both http and https versions
- Verify the path is `/api/auth/callback/google`

### "Invalid Client" Error
- Verify your Client ID and Secret are correct
- Check that the OAuth consent screen is published
- Ensure the Google+ API is enabled

### Session Not Persisting
- Clear browser cookies
- Check that `BETTER_AUTH_SECRET` is set
- Verify database connection

---

## 📚 Additional Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Apps Guide](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps)
