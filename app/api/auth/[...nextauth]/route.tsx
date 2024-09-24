import { fetchUser } from "@/lib/actions/user.actions";
import connectToDb from "@/lib/drizzle";
import { users } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  pages: { signIn: "/sign-in" },
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      type: "credentials",
      credentials: {
        username: { label: "Username", type: "text", },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if(!credentials || !credentials.username || !credentials.password) throw new Error("No credentials provided");
        try {
          const userResponse = await fetchUser(credentials.username);
          if (!userResponse || !userResponse.data) {
            throw new Error("No user found");
          }

          const user = userResponse.data;
          if (user.password === null) {
            throw new Error("Wrong authentication method");
          }
          if (user.password !== credentials.password) {
            throw new Error("Password does not match");
          }
          return user;
        } catch (error: any) {
          console.log(`[auth] ${error.message}`);
          throw new Error(error.message);
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        const id: string = user.id;
        const db = await connectToDb();
        const existingUser = await db.select().from(users).where(eq(users.id, id));

        return {
          ...token,
          id: user.id,
          username: existingUser[0].username,
          role: existingUser[0].role,
          provider: account.provider
        }
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
          username: token.username
        }
      };
    },
    async signIn({ user, account }) {
      try {
        const db = await connectToDb();
        if(!account) throw new Error("No account found");
        const id: string = user.id;

        const existingUser = await db.select().from(users).where(eq(users.id, id));
        if(existingUser.length === 0) {
          await db.insert(users).values({
            id,
            username: user.name || "",
            role: "user"
          })
        }

        return true;
      } catch(error: unknown) {
        console.error(error);
        return false;
      }
    }
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }
