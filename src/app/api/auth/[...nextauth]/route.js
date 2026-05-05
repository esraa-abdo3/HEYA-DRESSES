
// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";
// import dbConnect from "@/lib/dbConnect";
// import User from "@/models/Usermodel";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// const handler = NextAuth({

//   providers: [
//     // ✅ Google
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),

//     // ✅ Credentials
//     CredentialsProvider({
//       name: "credentials",
//       credentials: {
//         email: {},
//         password: {},
//       },

//       async authorize(credentials) {
//         try {
//           await dbConnect();

//           const user = await User.findOne({
//             email: credentials.email,
//           });

//           if (!user) {
//             throw new Error("Invalid email or password");
//           }

//           const isPasswordCorrect = await bcrypt.compare(
//             credentials.password,
//             user.password
//           );

//           if (!isPasswordCorrect) {
//             throw new Error("Invalid email or password");
//           }


//           return  user
//         } catch (err) {
        
//           throw err;
//         }
//       },
//     }),
//   ],

//   callbacks: {
//     async signIn({ user, account }) {
//       try {
//         await dbConnect();

//         // ✅ Google login
//         if (account.provider === "google") {
//           const existingUser = await User.findOne({
//             email: user.email,
//           });

//           if (!existingUser) {
//             await User.create({
//               username: user.name || "user",
//               email: user.email,
//               password: "",
//             });
//           }
//         }

//         return true;
//       } catch (err) {
//         console.log("🔥 SIGNIN ERROR:", err);
//         return false;
//       }
//     },

// async jwt({ token, user }) {
//   if (user) {
//     token.id = user._id || user.id;

//     token.accessToken = jwt.sign(
//       {
//         id: user._id || user.id,
//         email: user.email,
//       },
//       process.env.NEXTAUTH_SECRET,
//       { expiresIn: "7d" }
//     );
//   }

//   return token;
// },

// async session({ session, token }) {
//   session.user.id = token.id;
//   session.accessToken = token.accessToken;

//   return session;
// }
//   },

//   secret: process.env.NEXTAUTH_SECRET,
// });

// export { handler as GET, handler as POST };
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/Usermodel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ IMPORTANT: لازم يتعمل export
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        await dbConnect();

        const user = await User.findOne({ email: credentials.email });

        if (!user) throw new Error("Invalid email or password");

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) throw new Error("Invalid email or password");

        return user;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user._id || user.id;

        token.accessToken = jwt.sign(
          {
            id: user._id || user.id,
            email: user.email,
          },
          process.env.NEXTAUTH_SECRET,
          { expiresIn: "7d" }
        );
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.accessToken = token.accessToken;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// ✅ handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };