
// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";
// import dbConnect from "@/lib/dbConnect";
// import User from "@/models/Usermodel";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// // ✅ IMPORTANT: لازم يتعمل export
// export const authOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),

//     CredentialsProvider({
//       name: "credentials",
//       credentials: {
//         email: {},
//         password: {},
//       },

//       async authorize(credentials) {
//         await dbConnect();

//         const user = await User.findOne({ email: credentials.email });

//         if (!user) throw new Error("Invalid email or password");

//         const isValid = await bcrypt.compare(
//           credentials.password,
//           user.password
//         );

//         if (!isValid) throw new Error("Invalid email or password");

//         return user;
//       },
//     }),
//   ],

//   callbacks: {
    
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user._id || user.id;

//         token.accessToken = jwt.sign(
//           {
//             id: user._id || user.id,
//             email: user.email,
//           },
//           process.env.NEXTAUTH_SECRET,
//           { expiresIn: "7d" }
//         );
//       }

//       return token;
//     },

//     async session({ session, token }) {
//       session.user.id = token.id;
//       session.accessToken = token.accessToken;
//       return session;
//     },
//   },

//   secret: process.env.NEXTAUTH_SECRET,
// };

// // ✅ handler
// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/Usermodel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.username,
        };
      },
    }),
  ],

  callbacks: {
    // 🔥 هنا بنوحّد الـ user في كل الحالات (Google + Credentials)
    async jwt({ token, user, account, profile }) {
      await dbConnect();

      if (user) {
        let dbUser = await User.findOne({ email: user.email });

        // لو Google user جديد → نعمله save في Mongo
        if (!dbUser && account?.provider === "google") {
          dbUser = await User.create({
            email: user.email,
            username: user.name,
            provider: "google",
          });
        }

        token.id = dbUser._id.toString();
        token.email = dbUser.email;
        token.role=dbUser.role

        token.accessToken = jwt.sign(
          {
            id: dbUser._id.toString(),
            email: dbUser.email,
          },
          process.env.NEXTAUTH_SECRET,
          { expiresIn: "7d" }
        );
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.accessToken = token.accessToken;
      session.user.role=token.role

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };