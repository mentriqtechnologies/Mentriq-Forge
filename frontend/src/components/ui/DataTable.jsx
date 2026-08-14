import React from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

const DataTable = ({ columns, data, onRowClick, sortable, onSort, sortField, sortDirection, caption, emptyMessage = "No data found", minWidth = "560px" }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm" style={{ minWidth }} aria-label={caption}>
        {caption && (
          <caption className="sr-only">{caption}</caption>
        )}
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {columns.map((col) => {
              const isSorted = col.sortable && sortField === col.key;
              const sortDir = isSorted ? (sortDirection === "asc" ? "ascending" : "descending") : undefined;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={sortDir}
                  className={`px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider ${col.sortable ? "select-none" : ""}`}
                  style={col.width ? { width: col.width } : {}}
                >
                  {col.sortable && onSort ? (
                    <button
                      type="button"
                      onClick={() => {
                        const dir = sortField === col.key && sortDirection === "asc" ? "desc" : "asc";
                        onSort(col.key, dir);
                      }}
                      className="inline-flex items-center gap-1 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-primary rounded"
                    >
                      {col.label}
                      {isSorted ? (
                        sortDirection === "asc" ? (
                          <ChevronUp className="w-3 h-3" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="w-3 h-3" aria-hidden="true" />
                        )
                      ) : (
                        <ChevronsUpDown className="w-3 h-3 text-slate-300" aria-hidden="true" />
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                {emptyMessage}
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
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-slate-700 align-middle">
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