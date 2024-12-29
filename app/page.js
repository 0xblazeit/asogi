import RotatingObject from "./components/RotatingObject";

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden">
      {/* <RotatingObject walletAddress="0xcEB780385e065697669E33a07266303598D085fB" /> */}
      {/* <RotatingObject walletAddress="0xEd46d30d321cDB2959DA0ad2dF5BC3c93AadE204" /> */}
      <RotatingObject walletAddress="0xcEB780385e065697669E33a07266303598D085fB" />
      {/* <RotatingObject walletAddress="0x1234567890abcdef1234567890abcdef12345678" /> */}
      {/* <RotatingObject walletAddress="0xABCDEF0123456789abcdef0123456789abcdef12" /> */}
    </main>
  );
}
