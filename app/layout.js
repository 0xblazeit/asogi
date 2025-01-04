import "./globals.css";
import localFont from "next/font/local";
import NavBar from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Providers } from "@/providers";
import { VerticalNavbar } from "./components/VerticalNavbar";
import RotatingObject from "./components/RotatingObject";

const DepatureMono = localFont({
  src: "./fonts/DepartureMono-Regular.woff",
  variable: "--font-depature-mono",
  weight: "400",
});

export const metadata = {
  title: "Asogi",
  description: "A generative art canvas",
};

export default function RootLayout({ children }) {
  const generateRandomWalletAddress = () => {
    // Generate a random 40-character hexadecimal string (20 bytes)
    const randomBytes = Array.from({ length: 20 }, () => Math.floor(Math.random() * 256));

    return "0x" + randomBytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  };

  const walletAddress = generateRandomWalletAddress();
  return (
    <html lang="en">
      <body className={`${DepatureMono.className} antialiased`}>
        <Providers>
          <RotatingObject walletAddress={walletAddress} />
          <NavBar />
          <VerticalNavbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
