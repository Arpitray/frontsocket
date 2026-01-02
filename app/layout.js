import { Patrick_Hand, Bangers } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import ClientProviders from "./ClientProviders";

const patrickHand = Patrick_Hand({
  weight: '400',
  subsets: ["latin"],
  variable: "--font-comic",
});

const bangers = Bangers({
  weight: '400',
  subsets: ["latin"],
  variable: "--font-bangers",
});

export const metadata = {
  title: "NewStream Comic",
  description: "Interactive comic style streaming",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${patrickHand.variable} ${bangers.variable} antialiased paper-texture`}
      >
        <ClientProviders>
          {children}
        </ClientProviders>
       
       
      </body>
    </html>
  );
}
