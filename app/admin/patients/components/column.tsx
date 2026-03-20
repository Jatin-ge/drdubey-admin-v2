"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GenderType } from "@prisma/client";
import { ColumnDef, FilterFn } from "@tanstack/react-table";
import axios from "axios";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { CellAction } from "./cell-action";

export type LeadCloumn = {
  id: string;
  name: string;
  address: string | null;
  age: number | null;
  gender: GenderType;
  doad: string | null;
  phone: string | null;
  dood: string | null;
  dx: string | null;
  surgery: string | null;
  remark: string | null;
  ipdReg: number | null;
  bill: number | null;
  implant: string | null;
  side: string | null;
  patientStatus: string | null;
  tpa: string | null;
  city: string | null;
  hospital: string | null;
};

// Surgery options will be fetched from database

const implantOptions = [
  "Stryker",
  "Smith & Nephew",
  "Zimmer Biomet",
  "DePuy Synthes",
  // Add more implant options as needed
];

const selectFilterFn: FilterFn<any> = (row, columnId, value, addMeta) => {
  if (value === undefined || value.length === 0) {
    return false;
  } else {
    const { someProp, otherProp } = mapOrConvertBackLabel(value);
    return (
      someProp.includes(row.original.status?.someProp) &&
      otherProp.includes(row.original.status?.otherProp)
    );
  }
};

// Update the ColumnDefWithFilter type definition
type ColumnDefWithFilter<TData, TValue> = ColumnDef<TData, TValue> & {
  filterComponent?: React.ComponentType<{
    column: any;
  }>;
  enableFiltering?: boolean;
};

const CityFilter = ({ column }: { column: any }) => {
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get("/api/cities");
        setCities(response.data);
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      }
    };

    fetchCities();
  }, []);

  return (
    <select
      value={(column?.getFilterValue() as string) ?? ""}
      onChange={(event) => column?.setFilterValue(event.target.value)}
      className="h-8 w-[150px] rounded-md border border-input bg-background px-2 text-sm"
    >
      <option value="">Filter City</option>
      {cities.map((city) => (
        <option key={city} value={city}>
          {city}
        </option>
      ))}
    </select>
  );
};

const SurgeryFilter = ({ column }: { column: any }) => {
  const [surgeryTypes, setSurgeryTypes] = useState<string[]>([]);

  useEffect(() => {
    const fetchSurgeryTypes = async () => {
      try {
        const response = await axios.get("/api/surgery-types");
        setSurgeryTypes(response.data);
      } catch (error) {
        console.error("Failed to fetch surgery types:", error);
      }
    };

    fetchSurgeryTypes();
  }, []);

  return (
    <select
      value={(column?.getFilterValue() as string) ?? ""}
      onChange={(event) => column?.setFilterValue(event.target.value)}
      className="h-8 w-[150px] rounded-md border border-input bg-background px-2 text-sm"
    >
      <option value="">Filter Surgery</option>
      {surgeryTypes.map((surgery) => (
        <option key={surgery} value={surgery}>
          {surgery}
        </option>
      ))}
    </select>
  );
};

const ImplantFilter = ({ column }: { column: any }) => (
  <select
    value={(column?.getFilterValue() as string) ?? ""}
    onChange={(event) => column?.setFilterValue(event.target.value)}
    className="h-8 w-[150px] rounded-md border border-input bg-background px-2 text-sm"
  >
    <option value="">Filter Implant</option>
    {implantOptions.map((implant) => (
      <option key={implant} value={implant}>
        {implant}
      </option>
    ))}
  </select>
);

const StatusFilter = ({ column }: { column: any }) => (
  <select
    value={(column?.getFilterValue() as string) ?? ""}
    onChange={(event) => column?.setFilterValue(event.target.value)}
    className="h-8 w-[150px] rounded-md border border-input bg-background px-2 text-sm"
  >
    <option value="">Filter Status</option>
    <option value="OPD">OPD</option>
    <option value="IPD">IPD</option>
  </select>
);

const HospitalFilter = ({ column }: { column: any }) => (
  <select
    value={(column?.getFilterValue() as string) ?? ""}
    onChange={(event) => column?.setFilterValue(event.target.value)}
    className="h-8 w-[150px] rounded-md border border-input bg-background px-2 text-sm"
  >
    <option value="">All Hospitals</option>
    <option value="Shalby">Shalby</option>
    <option value="Tagore">Tagore</option>
    <option value="Other">Other</option>
  </select>
);

export const columns: ColumnDefWithFilter<LeadCloumn, any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center gap-2">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select page"
          className="translate-y-[2px]"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => table.toggleAllRowsSelected(true)}>
              Select all data
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => table.toggleAllRowsSelected(false)}
            >
              Deselect all
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "name",
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <span>Name</span>
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 w-8 p-0"
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "age",
    header: "Age",
  },
  {
    accessorKey: "gender",
    header: "Sex",
  },
  {
    accessorKey: "city",
    header: ({ column }) => <CityFilter column={column} />,
  },
  {
    accessorKey: "doad",
    header: "D.O.AD",
  },
  {
    accessorKey: "dood",
    header: "D.O.OP",
  },
  {
    accessorKey: "dx",
    header: "Description",
  },
  {
    accessorKey: "surgery",
    header: ({ column }) => <SurgeryFilter column={column} />,
  },
  {
    accessorKey: "side",
    header: "Side",
  },
  {
    accessorKey: "implant",
    header: ({ column }) => <ImplantFilter column={column} />,
    enableSorting: true,
  },
  {
    accessorKey: "remark",
    header: "Remark",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "patientStatus",
    header: ({ column }) => <StatusFilter column={column} />,
    enableSorting: true,
  },
  {
    accessorKey: "tpa",
    header: "TPA",
  },
  {
    accessorKey: "ipdReg",
    header: "IPD Reg",
  },
  {
    accessorKey: "bill",
    header: "Bill",
    cell: ({ row }) => (
      <div className="font-medium">₹{row.getValue("bill")}</div>
    ),
  },
  {
    accessorKey: "hospital",
    header: ({ column }) => <HospitalFilter column={column} />,
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.hospital ?? "—"}</div>;
    },
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

function mapOrConvertBackLabel(value: any): { someProp: any; otherProp: any } {
  throw new Error("Function not implemented.");
}
