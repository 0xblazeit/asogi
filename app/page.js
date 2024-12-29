import RotatingObject from "./components/RotatingObject";

export default function Home() {
  return (
    <main className="h-screen overflow-hidden">
      <div className="flex-1">
        <RotatingObject />
      </div>
    </main>
  );
}
