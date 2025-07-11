import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PageNavBar from "./pageNavBar";
import Title from "./title";
import SearchBar from "./searchBar";
import MessageBlock from "./messageBlock";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <header>
          <Title></Title>
          <MessageBlock></MessageBlock>
          <SearchBar></SearchBar>
        </header>
        <div className="page">
          {children}
        </div>
        <PageNavBar></PageNavBar>
      </body>
    </html>
  );
}
