import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/lib/components/Header";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/lib/components/Providers";
import { ToastProvider } from "@/lib/context/ToastContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "aXiom - [FELINE GENETICS LABORATORY] | Feedback Analyzer",
  description:
    "aXiom: An intergalactic bio-engineering lab specialising in splicing alien DNA with Earth's cutest cats. Submit feedback on your cosmic kitties and let our AI analyse, prioritise, and triage incidents - from harmless glowing whiskers to dimension-rending hairballs.",
  keywords: [
    "aXiom",
    "alien cats",
    "bio-engineering",
    "feedback analyzer",
    "AI analysis",
    "cosmic kitties",
    "DNA splicing",
    "intergalactic pets",
  ],
  openGraph: {
    title: "aXiom - [FELINE GENETICS LABORATORY]",
    description:
      "Submit feedback about your genetically-enhanced alien cats and let our AI determine importance, danger level, and urgency. Perfect for owners of telepathic, bioluminescent, or multi-tailed felines.",
    url: "https://axiom-exfzklg83-socialspells-projects.vercel.app/",
    siteName: "aXiom Alien DNA Labs",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <Providers>
            <Header />
            {children}
            <SpeedInsights />
          </Providers>
        </ToastProvider>
      </body>
    </html>
  );
}
