"use client";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import TaskBoard from "@/components/TaskBoard";
import TaskCard from "@/components/TaskCard";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      {/* <TaskCard /> */}
      <TaskBoard />
      <Footer />
    </div>
  );
}
