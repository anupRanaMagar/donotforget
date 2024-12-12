"use client";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import TaskBoard from "@/components/TaskBoard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const user = useSession();
  if (user.status === "unauthenticated") {
    router.push("login");
  }
  return (
    <div className="flex flex-col  h-screen ">
      <NavBar />
      {/* <TaskCard /> */}
      <TaskBoard />
      <Footer />
    </div>
  );
}
