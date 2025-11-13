import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import AddJob from "./addjob";


export default function NavBar() {

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
      if (!data.isSuccess) {
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

  const handleChangeRole = async () => {

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/changerole`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",

      });
      const data = await res.json();
      if (!data.isSuccess) {
        console.log("error")
        router.push("/login");
        return
      }
      router.replace("/hr");
    } catch (error) {
      console.log(error)
      router.push("/login");
    } finally {

    }
  };

  return (<>
    <div className="navbar mx-auto my-3 bg-neutral shadow-sm text-neutral-50 rounded-lg w-[98%]">
      <div className="flex-1">
        <p className="mx-5 font-bold text-2xl">Hirenz</p>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li> <Button className="bg-stone-100 text-black hover:bg-stone-300 mr-5" onClick={handleChangeRole}>Candidate</Button> </li>
          <li>
            <AddJob></AddJob>
          </li>
          <li> <Button className="bg-stone-100 text-black hover:bg-stone-300 mr-5" onClick={handleLogout}>Logout</Button> </li>
        </ul>
      </div>
    </div>
  </>)
}