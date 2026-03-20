"use client";

import { Button } from "./button";
import { useModal } from "@/hooks/use-modal-store";


const SelectCity = () => {
    const { onOpen } = useModal();

    return ( 
        <div className="text-lg  md:text-3xl font-semibold text-center m-12">
          <div className="my-8">
            Book an Appointment to create Patient Profile !
          </div>
          <Button
            onClick={() => onOpen("selectCity")}
            className="p-2 border  relative inline-flex justify-center items-center gap-x-3 text-center bg-primary hover:bg-blue-700  border-primary text-xl lg:text-base text-white  rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white transition py-3 px-4 dark:focus:ring-offset-gray-800"
          >
            Book an appointment
          </Button>
        </div>
     );
}
 
export default SelectCity;