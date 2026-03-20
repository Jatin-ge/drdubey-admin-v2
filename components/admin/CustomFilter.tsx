// import { LeadCloumn } from "@/app/admin/patients/components/column";
// import { Column, Table } from "@tanstack/react-table";
// import { useMemo } from "react";

// export const CustomFilter = ({ column, table }: { column: Column<any, unknown>; table: Table<any> }) => {
//   const columnFilterValue = column.getFilterValue();

//   const options = useMemo(() => {
//     const options = new Set();
//     table.getPreFilteredRowModel().flatRows.forEach(row => {
//       const myObj = row.getValue<LeadCloumn>(column.id);
//       let label = getLabelForYourNeed(myObj);
//       options.add(label);
//     });
//     return [...options.values()]
//   }, [column.id, table.getPreFilteredRowModel()]);

//   return (
//     <div className="flex relative">
//       <select
//         className="..."
//         title="filter"
//         value={(columnFilterValue ?? '') as string}
//         onChange={e => column.setFilterValue(e.target.value)}
//       >
//         <option value="">All</option>
//         {options
//           .filter(x => x !== undefined && x !== null)
//           .map((option: any, i, _) => (
//             <option key={i} value={option}>
//               {option}
//             </option>
//           ))}
//       </select>
//     </div>
//   );
// }

// function getLabelForYourNeed(myObj: LeadCloumn) {
//     throw new Error("Function not implemented.");
// }
