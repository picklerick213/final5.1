import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { User } from '@/models/User';
import NextAuth from "next-auth";
import { getServerSession } from "next-auth/react";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/libs/mongoConnect";
import { UserInfo } from "../../../../models/UserInfo";

const adapter = new MongoDBAdapter(clientPromise);

export const authOptions = {
  secret: process.env.SECRET,
  adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      id: 'credentials',
      credentials: {
        username: { label: "Email", type: "email", placeholder: "test@example.com" },
        password: { label: "Password", type: "password", placeholder: "password" }
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        await mongoose.connect(process.env.MONGO_URL);

        const user = await User.findOne({ email });
        if (!user) return null;

        const passwordOk = bcrypt.compareSync(password, user.password);
        if (!passwordOk) return null;

        return user;
      }
    })
  ],
};

const handler = NextAuth(authOptions);

export default handler;
