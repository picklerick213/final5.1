import bcrypt from "bcrypt";
import mongoose from "mongoose";
import NextAuth from "next-auth";
import { Session } from "next-auth"; // Import Session from next-auth
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@/auth/mongodb-adapter"; // Adjusted import path
import clientPromise from "@/src/libs/mongoConnect"; // Adjusted import path
import UserInfo from "@/models/UserInfo"; // Adjusted import path

interface Credentials {
  email: string;
  password: string;
}

export const authOptions: NextAuth.Options = {
  secret: process.env.SECRET,
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider<Credentials>({
      name: "Credentials",
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@example.com" }, // Corrected label to email
        password: { label: "Password", type: "password", placeholder: "password" },
      },
      async authorize(credentials: Credentials, req: NextAuth.GetApiHandlerOptions): Promise<UserInfo | null> { // Changed return type to UserInfo | null
        const email = credentials?.email;
        const password = credentials?.password;

        await mongoose.connect(process.env.MONGO_URL);
        const user = await User.findOne({ email });
        const passwordOk = user && bcrypt.compareSync(password, user.password);

        if (passwordOk) {
          return user; // Return UserInfo instance
        }

        return null;
      },
    }),
  ],
};

export const handler: NextAuth.GetApiHandler<Session> = NextAuth(authOptions);

export { handler as GET, handler as POST };
