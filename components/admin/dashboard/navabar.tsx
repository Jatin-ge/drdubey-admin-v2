"use client"

import { MainNav } from "@/components/admin/dashboard/main-nav";
import ThemeChanger from "@/components/Navbar/DarkSwitch";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { Plus, Upload } from "lucide-react";

const Navbar = () => {

  const {onOpen} = useModal()

  return ( 
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <MainNav className="mx-6" />
        <div className="ml-4 flex justify-start items-start">
          <Button onClick={() => onOpen("imageUpload")}>
            <Upload className="h-4 w-4 mr-4"/>
              Upload Image
          </Button>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <ThemeChanger/>
        </div>
        
      </div>
    </div>
  );
};
 
export default Navbar;