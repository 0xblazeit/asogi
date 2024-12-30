import { VT323 } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";
const vt323 = VT323({
  weight: "400",
  variable: "--font-vt323",
});

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
      <body className={`${DepatureMono.className} antialiased`}>{children}</body>
    </html>
  );
}
