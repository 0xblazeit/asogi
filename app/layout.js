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
  return (
    <html lang="en">
      <body className={`${DepatureMono.className} antialiased`}>
        <Providers>
          <RotatingObject />
          <NavBar />
          <VerticalNavbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
