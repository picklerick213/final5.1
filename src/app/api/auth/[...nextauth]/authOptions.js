import NextAuth from "next-auth";
import { authOptions } from "@/path/to/authOptions"; // Adjust the path accordingly

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
