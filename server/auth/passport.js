// ✅ Import Passport and Google OAuth 2.0 Strategy
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// ✅ Import User model — make sure this matches your schema file
import User from '../models/UserModel.js';
console.log('🧠 [Passport Init] User model methods:', Object.keys(User));

// ✅ Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,         // 🔐 Required from Google Cloud Console
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // 🔐 Required from Google Cloud Console
      callbackURL: '/api/auth/google/callback',       // 🔁 Full path to match Express mount point
    },

    // 🎯 Called when Google sends back user info
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('\n🔑 [Passport] Google OAuth callback triggered');
        console.log(`🧠 Profile ID: ${profile.id}`);
        console.log(`👤 Name: ${profile.displayName}`);
        console.log(`📧 Email: ${profile.emails?.[0]?.value}`);
        console.log(`🖼️ Avatar: ${profile.photos?.[0]?.value}`);

        // 🔍 Check if the user already exists in MongoDB
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          console.log(`✅ Existing user found: ${existingUser.name}`);
          return done(null, existingUser); // ➡️ Proceed with existing user
        }

        // 🆕 If new, create and save the user
        const newUser = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value || '',
          avatar: profile.photos?.[0]?.value || '',
        });

        console.log(`🎉 New user created: ${newUser.name}`);
        return done(null, newUser);
      } catch (err) {
        console.error('❌ [Passport] GoogleStrategy error:', err.message);
        return done(err, null);
      }
    }
  )
);

// 💾 Called on login to store user ID in session
passport.serializeUser((user, done) => {
  console.log(`💾 [Passport] serializeUser: storing ID in session: ${user.id}`);
  done(null, user.id); // Only the user ID is stored in the cookie
});

// 🔓 Called on every request to restore user session from stored ID
passport.deserializeUser(async (id, done) => {
  try {
    console.log(`📦 [Passport] deserializeUser: looking up user by ID: ${id}`);
    const user = await User.findById(id);

    if (!user) {
      console.warn('⚠️ User not found during deserialization');
      return done(null, false);
    }

    console.log(`🔓 [Passport] Session user restored: ${user.name}`);
    done(null, user); // Attach full user object to `req.user`
  } catch (err) {
    console.error(`❌ [Passport] deserializeUser error:`, err.message);
    done(err, null);
  }
});