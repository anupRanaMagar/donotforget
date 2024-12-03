import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

function Page() {
  return (
    <div className="h-screen flex items-center justify-center">
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/" });
        }}
      >
        <Button variant="outline" type="submit">
          <GithubIcon />
          Signin with GitHub
        </Button>
      </form>
    </div>
  );
}

export default Page;
