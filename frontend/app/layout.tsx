import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthContext from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Healthcare AI Assistant",
  description:
    "AI-assisted healthcare query system with clinician verification",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthContext>
          <NotificationProvider>{children}</NotificationProvider>
        </AuthContext>
      </body>
    </html>
  );
}
