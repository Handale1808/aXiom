"use client";
import TextSubmit from "@/lib/components/TextSubmit";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <TextSubmit onSubmit={(text) => console.log(text)} />
    </div>
  );
}
