"use client";

import { useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import Link from "next/link";

export default function GoogleMaps() {
  const position1 = { lat: 26.903488202765963, lng:75.72921788230423};
  const position2 = {lat:26.82723369883703, lng:75.85228368196005}

  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);

  return (
    <APIProvider apiKey="AIzaSyBAi8dE58UCX0blqwVUKRv8z7Yw0zGPYDs">
      <div className="mx-auto" style={{ height: "60vh", width: "90%" }}>
        <Map zoom={12} center={position1} mapId="2356584220fb1eb7">
          <AdvancedMarker position={position1} onClick={() => {setOpen1(true)
          
        }}>
            <Pin
              background={"red"}
              borderColor={"black"}
              glyphColor={"black"}
            />
          </AdvancedMarker>

          {open1 && (
            <InfoWindow position={position1} onCloseClick={() => setOpen1(false)}>
             
                <p className=" text-sm font-bold">Dr. Dheeraj Dubay</p>
                <p className="pt-1 w-40 mx-auto">Shalby Hospital: Ajmer Expressway 200 Feet Bypass Road, near Gandhi Path, Chitrakoot Sector 3, Vaishali Nagar, Jaipur, Rajasthan 302021</p>
                <Link target="_blank" href="https://maps.app.goo.gl/R9RLVhxStePChnRw8">
                  <p className="pt-1 w-40 mx-auto text-blue-700 font-bold underline" >View on Google Maps</p>
                </Link>
                
              
            </InfoWindow>
          )}
          <AdvancedMarker position={position2} onClick={() => 
          {
            setOpen2(true)
        }}>
            <Pin
              background={"red"}
              borderColor={"black"}
              glyphColor={"black"}
            />
          </AdvancedMarker>

          {open2 && (
            <InfoWindow position={position2} onCloseClick={() => setOpen2(false)}>
             
                <p className=" text-sm font-bold">Dubay’s Hip & Knee clinic</p>
                <p className="pt-1 w-40 mx-auto">297, Gali Number 6, Kusum Vihar, Vidhyadhar Nagar, Jagatpura, Jaipur, Rajasthan 302017</p>
                <Link target="_blank" href="https://maps.app.goo.gl/kAMVprRz6AkWpjESA">
                  <p className="pt-1 w-40 mx-auto text-blue-700 font-bold underline" >View on Google Maps</p>
                </Link>
                
              
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
}