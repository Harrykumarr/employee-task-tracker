"use client"

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  className,
  ...props
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      console.log("🔄 Attempting login for:", email);
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      console.log("📝 SignIn response:", res);

      if (res?.error) {
        console.log("❌ Login error:", res.error);
        setError("Invalid email or password");
        return;
      }

      if (res?.ok) {
        console.log("✅ Login successful, redirecting...");
        router.replace("/dashboard");
      }
    } catch (error) {
      console.error("💥 Login exception:", error);
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-foreground">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email"
            type="email" 
            placeholder="m@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline text-primary">
              Forgot your password?
            </a>
          </div>
          <Input 
            id="password" 
            name="password"
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <Button 
          type="submit" 
          className="w-full text-white"
        >
          Login
        </Button>
        <div
          className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="underline underline-offset-4">Register</Link>
      </div>
    </form>
  )
}