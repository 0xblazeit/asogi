import "./globals.css";
import localFont from "next/font/local";
import NavBar from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Providers } from "@/providers";

const DepatureMono = localFont({
  src: "./fonts/DepartureMono-Regular.woff",
  variable: "--font-depature-mono",
  weight: "400",
});

export const metadata = {
  title: "Hinata AI",
  description: "Hinata AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${DepatureMono.className} antialiased`}>
        <Providers>
          <NavBar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
