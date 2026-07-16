import React from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

const DataTable = ({ columns, data, onRowClick, sortable, onSort, sortField, sortDirection }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`
                  px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider
                  ${col.sortable ? "cursor-pointer select-none hover:text-slate-700" : ""}
                `}
                style={col.width ? { width: col.width } : {}}
                onClick={() => {
                  if (col.sortable && onSort) {
                    const dir = sortField === col.key && sortDirection === "asc" ? "desc" : "asc";
                    onSort(col.key, dir);
                  }
                }}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    sortField === col.key ? (
                      sortDirection === "asc" ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 text-slate-300" />
                    )
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                No data found
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row._id || row.id || i}
                className={`
                  bg-white transition-colors
                  ${onRowClick ? "cursor-pointer hover:bg-slate-50" : ""}
                `}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-slate-700">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
