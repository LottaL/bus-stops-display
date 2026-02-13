# 🔑 Getting Your Digitransit API Key

Since January 31, 2024, the Digitransit API **requires authentication**. Follow these steps to get your API key:

## Step 1: Register
1. Go to https://portal-api.digitransit.fi/
2. Click "Sign up" in the top right corner
3. Enter your email address (you'll need access to confirm)
4. Complete the two-factor authentication setup (email or authenticator app)

## Step 2: Subscribe to API
1. Log in to the portal
2. Click the **"Products"** tab
3. Find and click on the API product you want (e.g., "Routing API")
4. Click the **"Subscribe"** button
5. Answer the brief questionnaire if prompted

## Step 3: Get Your API Key
1. Go to the **"Profile"** tab
2. You'll see your subscription details
3. Click **"Show"** to reveal your API key
4. Copy the full key (it's a long string)

## Step 4: Add to Your Project
1. Open `.env.local` in your project root (or create it if it doesn't exist)
2. Add this line:
   ```
   VITE_DIGITRANSIT_API_KEY=your_api_key_here
   ```
3. Replace `your_api_key_here` with your actual API key from step 3
4. Save the file

## Step 5: Restart Dev Server
1. Stop your dev server (Ctrl+C in terminal)
2. Run `npm run dev` again
3. The app should now work!

## 💡 Tips

- **Free tier available**: The free subscription gives you plenty of requests for personal projects
- **Multiple keys**: You get a primary and secondary key - useful for rotating keys
- **Headers vs URL**: While the key can be passed as either a header or URL parameter, this app uses the `digitransit-subscription-key` header (more secure)
- **Don't commit**: Never commit `.env.local` to git - it contains your secret key!

## ❌ If You Get Errors

**401 Unauthorized**: Your API key is missing or invalid
- Check that `VITE_DIGITRANSIT_API_KEY` is correctly set in `.env.local`
- Verify the key was copied completely (no extra spaces)
- Try regenerating a new key in the portal

**403 Forbidden**: Rate limiting
- You've made too many requests too quickly
- Small delays between requests help (the app already includes auto-refresh intervals)

**Other errors**: Check browser console (F12) for detailed messages

## 📚 More Info

- Digitransit API Docs: https://digitransit.fi/en/developers/apis/
- Registration Portal: https://portal-api.digitransit.fi/
- Support: digitransit-api@hsl.fi
