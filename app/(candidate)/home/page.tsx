"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Page() {

  const router = useRouter();

  const handleLogout = async () => {

    try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/logout`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",  

    });
    const data = await res.json();
    if(!data.isSuccess){
        console.log("error")
        router.push("/login");
        return
    }
    router.push("/login");
    console.log("ok")
    } catch (error) {
      console.log(error)
      router.push("/login");
    } finally {

    }
  };
  
  return (
   <>
   <Button onClick={handleLogout}>Logout</Button>
   </>
  );
}
