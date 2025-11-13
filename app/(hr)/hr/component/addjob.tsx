import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function AddJob() {

    const [jobTitle,setJobTitle] = useState("")
    const [jobDetail,setJobDetail] = useState("")
    const [isAdding,setisAdding] = useState(false)
    const [msgerror,setmsgerror] = useState("")
    const [isSuccess,setisSuccess] = useState(false)
    

    const handleAddJob = async () =>{
        try{
            setisAdding(true)
            setisSuccess(false)
            setmsgerror("")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hr/addjob`,{
                method:"POST",
                headers:{
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body:JSON.stringify({
                    jobTitle: jobTitle,
                    description: jobDetail
                }),
            })
            const data = await res.json()
            if(!data.isSuccess){
                throw new Error(data.error ?? "error to add job.")
            }
            setmsgerror("")
            setisSuccess(true)
        }catch (error){
            setmsgerror("error to add job.")
        }finally{
            setisAdding(false)
        }
    }

    return (
        <Dialog>
                <DialogTrigger asChild>
                    <Button className="bg-stone-100 text-black hover:bg-stone-300 mr-5">Add Job</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add Job</DialogTitle>
                    </DialogHeader>

                    <Label>Title</Label>
                    <Input onChange={(e)=>setJobTitle(e.target.value)} value={jobTitle}></Input>
                    <Label>Detail</Label>
                    <Textarea className="max-h-100" placeholder="Type your job detail here." onChange={(e)=>{setJobDetail(e.target.value)}} value={jobDetail}/>
                        <p className="w-full text-center" >{isSuccess?"Success":msgerror?msgerror:""}</p>
                    <DialogFooter>
                        {!isAdding?<Button onClick={handleAddJob}>Add</Button>:<Button disabled>Adding...</Button>}
                        <DialogClose asChild>
                            <Button variant="outline" onClick={()=>{setisSuccess(false)}}>Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
        </Dialog>
    )
}