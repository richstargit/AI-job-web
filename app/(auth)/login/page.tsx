"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
    const router = useRouter();
const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errmsg, setErrMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if(username===''||password===''){
        setErrMsg("Please input your username or password")
        return
    }
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",  
      body: JSON.stringify({
        username: username,
        password: password
       }),
    });

    const data = await res.json();
    if(!data.isSuccess){
        setErrMsg("Your username or password incorrect")
        return
    }
    setErrMsg("")
    router.replace("/home");
    } catch (error) {
        console.log(error)
        setErrMsg("error "+error)
    } finally {
      setLoading(false);
    }
  };
  
  return (
   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex flex-col items-center">
            <h1 className="text-5xl font-bold text-[#274254]">Hirenz</h1>
          </CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Username</Label>
              <Input
                id="text"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          {errmsg?<p className="text-red-500 text-center text-sm font-medium">{errmsg}</p>:<></>}
          <div className="mt-4 text-center">
            <Button variant="link" className="text-sm" asChild>
      <Link href="/register">
        Don't have an account? Register as candidate
      </Link>
    </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
