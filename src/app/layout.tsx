import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Suckbot | Find what sucks most and make it great",
  description:
    "A conversational tool that helps organizations identify transformation targets, understand root causes, and design human-AI collaborative solutions.",
  openGraph: {
    title: "Suckbot | Human Machines",
    description: "Find what sucks most and make it great",
    url: "https://suckbot.human-machines.com",
    siteName: "Suckbot",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--color-surface-alt)]">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            },
          }}
        />
      </body>
    </html>
  );
}
