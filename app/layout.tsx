import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Holarchic Physics | Hamiltonian Dynamics & Emergent Memory",
  description: "Interactive 3D simulation exploring Hamiltonian mechanics, holarchic memory systems, and multi-scale emergent dynamics. Train and test fundamental physics concepts.",
  keywords: ["physics simulation", "Hamiltonian dynamics", "holarchy", "emergence", "three.js", "particle system"],
  authors: [{ name: "Holarchic Physics Lab" }],
  openGraph: {
    title: "Holarchic Physics Simulator",
    description: "Explore Hamiltonian dynamics and emergent memory in an interactive 3D environment",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#050510" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
