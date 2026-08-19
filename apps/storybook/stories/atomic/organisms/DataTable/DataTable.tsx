import { useState } from 'react';
import {
  ColumnDef,
  createPaginatedRowModel,
  createSortedRowModel,
  flexRender,
  PaginationState,
  RowData,
  rowPaginationFeature,
  rowSortingFeature,
  SortingState,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../molecules/Table/Table';
import { Button } from '../../atoms/Button/Button';

const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

export type DataTableFeatures = typeof dataTableFeatures;

export interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData, unknown>[];
  data: TData[];
  pageSize?: number;
  /**
   * Controlled pagination for server-driven data: when provided, `data` is
   * assumed to be exactly the current page's rows and `pageCount` (the
   * total number of pages) must also be provided. Uncontrolled (client-side
   * pagination over the full `data` array) otherwise.
   */
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  pageCount?: number;
  noResultsLabel: string;
  previousLabel: string;
  nextLabel: string;
  pageLabel: (currentPage: number, totalPages: number) => string;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  pageSize = 10,
  pagination: controlledPagination,
  onPaginationChange: controlledOnPaginationChange,
  pageCount,
  noResultsLabel,
  previousLabel,
  nextLabel,
  pageLabel,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    {
      pageIndex: 0,
      pageSize,
    },
  );

  const isManual = controlledPagination !== undefined;
  const pagination = controlledPagination ?? internalPagination;
  const setPagination = controlledOnPaginationChange ?? setInternalPagination;

  const handlePaginationChange = (
    updater: PaginationState | ((old: PaginationState) => PaginationState),
  ) => {
    const next = typeof updater === 'function' ? updater(pagination) : updater;
    setPagination(next);
  };

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: handlePaginationChange,
    ...(isManual ? { manualPagination: true, pageCount: pageCount ?? -1 } : {}),
  });

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sortDirection = header.column.getIsSorted();

                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase hover:text-gray-700"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        <span aria-hidden="true">
                          {sortDirection === 'asc'
                            ? '↑'
                            : sortDirection === 'desc'
                              ? '↓'
                              : ''}
                        </span>
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center text-gray-400"
              >
                {noResultsLabel}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {pageLabel(
            table.state.pagination.pageIndex + 1,
            Math.max(table.getPageCount(), 1),
          )}
        </span>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {previousLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {nextLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
