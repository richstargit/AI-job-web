import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function UploadPopup(){

    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleUploadResume = async () => {
    if (!resumeFile) {
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("cv", resumeFile);

    try {
      const response = await fetch("http://localhost:8000/users/addcandidate", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {

        setResumeFile(null);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {

    } finally {
      setUploading(false);
    }
  };

    return(<>
        <div className="flex flex-col items-center justify-center">
       <div className="space-y-2">
                <Label htmlFor="resume">Resume File</Label>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {resumeFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {resumeFile.name}
                  </p>
                )}
                 <Button
                onClick={handleUploadResume}
                disabled={!resumeFile || uploading}
                className="w-full"
              >
                {uploading ? "Uploading..." : "Upload Resume"}
              </Button>
              </div>
    </div>
    </>)
}