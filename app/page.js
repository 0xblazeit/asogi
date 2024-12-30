import RotatingObject from "./components/RotatingObject";

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden">
      <RotatingObject walletAddress="0xcEB780385e065697669E33a07266303598D085fB" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl md:text-5xl font-bold text-white z-10 tracking-widest">
        Hello World
      </div>
    </main>
  );
}
