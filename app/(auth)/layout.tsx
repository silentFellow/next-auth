import type { Metadata } from "next";
import Provider from "@/components/shared/Provider";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import "../globals.css"

export const metadata: Metadata = {
  title: "Read Blog",
  description: "blog",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session: Session | null = await getServerSession();

  return (
    <html lang="en">
      <body>
        <Provider session={session}>
          {children}
        </Provider>
      </body>
    </html>
  );
}
