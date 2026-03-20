"use client"

import { Button } from "@/components/ui/button"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  getSortedRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import React, { useState, forwardRef, useImperativeHandle } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import axios from "axios"
import { useModal } from "@/hooks/use-modal-store"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useRouter } from "next/navigation"
import { WHATSAPP_API_VERSION, WHATSAPP_PHONE_NUMBER_ID } from "@/lib/config"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  filterableColumns?: {
    id: string;
    title: string;
  }[];
}

export interface DataTableRef {
  getCurrentPageData: () => any[];
  getSelectedData: () => any[];
}

const DataTable = forwardRef<DataTableRef, DataTableProps<any, any>>(({
  columns,
  data,
  filterableColumns,
}, ref) => {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [rowSelection, setRowSelection] = React.useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = React.useState<Date>()

  const router = useRouter();

  const { onOpen } = useModal();

  const header = {
   "headers":{
    Authorization: process.env.NEXT_PUBLIC_WHATSAPP_TOKEN,
    Accept: "application/json"
    
   } 
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    
  })

  useImperativeHandle(ref, () => ({
    getCurrentPageData: () => {
      return table.getRowModel().rows.map(row => row.original);
    },
    getSelectedData: () => {
      return table
        .getFilteredRowModel()
        .rows.filter(row => row.getIsSelected())
        .map(row => row.original);
    }
  }));

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      for (const number of table.getFilteredSelectedRowModel().rows) {
        const body = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: number.original?.phone,
          type: "template",
          template: {
            name: "hello_world",
            language: {
              code: "en_US"
            },
          }
        };

        await axios.post(`https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, body, header);
        console.log("done");
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (date:any) => {
    setDate(date);
    const formattedDate =
    `${date.getDate().toString().padStart(2, '0')}-` +
    `${(date.getMonth() + 1).toString().padStart(2, '0')}-` +
    `${date.getFullYear()}`;
   

console.log(formattedDate); // Output: 29-11-2023

    table.getColumn("date")?.setFilterValue(formattedDate)

  }

  const clearFilter = () => {
    table.getColumn("name")?.setFilterValue("")
    table.getColumn("date")?.setFilterValue("")
  }

  const handleClick = (id: any, event: any) => {
    if(event.target.tagName === "BUTTON" ){
      return;
    }
    if(event.target.textContent === "Add to Leads"){
      return
    }
    router.push(`/admin/appointment/${id}`)
   
  }

  return (
    <div>
      <div className="flex flex-row justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter names..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <div className="ml-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                  
                >
                  <CalendarIcon className="mr-2 h-4 w-4 " />
                  {date ? format(date, "PPP") : <span>Pick a date to get appointments</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(event) => {handleChange(event)}} 
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button variant="outline" onClick={clearFilter}>
            See all
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      </div>

      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <Button
          className="bg-green-500 text-white mb-4"
          variant="outline"
          size="lg"
          onClick={() => onOpen("sendAppointmentReminder", {
            selectedLeads: table.getFilteredSelectedRowModel().rows.map(row => row.original)
          })}
          disabled={isLoading}
        >
          Send Appointment reminder
        </Button>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow  key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  //@ts-ignore
                  onClick={(event) => handleClick(row.original.userId, event) }
                  
                >
                  
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        Next
      </Button>
      
    </div>
    
  </div>
  );
});



DataTable.displayName = "DataTable"

export { DataTable }
