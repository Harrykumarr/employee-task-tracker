import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) redirect("/dashboard");
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div> */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/placeholder.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8] dark:grayscale"
        />
      </div>
      {/* Theme toggle button */}
      <div className="absolute top-4 right-4 z-10">
      </div>
    </div>
  )
}
