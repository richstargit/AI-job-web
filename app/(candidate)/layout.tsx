"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true)

        const verifyToken = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",

                });
                const data = await res.json();
                if (!data.isSuccess) {
                    throw new Error("Token invalid or expired");
                }
                if(data.user.isHR){
                    router.replace("/hr")
                }
                console.log(data)
            } catch (error) {
                router.push("/login");
            } finally {
                setLoading(false)
            }
        };

        verifyToken();
    }, [router]);

    return <>{children}</>;
}