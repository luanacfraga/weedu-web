'use client';

import React from 'react';
import { SortingState, PaginationState } from '@tanstack/react-table';
import { ResponsiveDataTableProps } from './types';
import { TableView } from './table-view';
import { CardView } from './card-view';
import { useResponsiveTable } from './use-responsive-table';
import { Pagination } from '@/components/shared/data/pagination';

export function ResponsiveDataTable<T>({
  data,
  columns,
  CardComponent,
  emptyMessage,
  isLoading,
  pagination,
  filters,
  manualPagination = false,
  manualSorting = false,
}: ResponsiveDataTableProps<T>) {
  const { viewMode } = useResponsiveTable();
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const pageCount = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : undefined;

  return (
    <div className="space-y-4">
      {/* Filters slot */}
      {filters && <div>{filters}</div>}

      {/* Table or Cards based on viewport */}
      {viewMode === 'cards' ? (
        <CardView
          data={data}
          CardComponent={CardComponent}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
        />
      ) : (
        <TableView
          data={data}
          columns={columns}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          sorting={sorting}
          onSortingChange={setSorting}
          pagination={
            pagination
              ? {
                  pageIndex: pagination.page - 1,
                  pageSize: pagination.pageSize,
                }
              : undefined
          }
          onPaginationChange={(updater) => {
            if (pagination) {
              const currentState: PaginationState = {
                pageIndex: pagination.page - 1,
                pageSize: pagination.pageSize,
              };
              const newState =
                typeof updater === 'function' ? updater(currentState) : updater;
              pagination.onPageChange(newState.pageIndex + 1);
              pagination.onPageSizeChange(newState.pageSize);
            }
          }}
          manualPagination={manualPagination}
          manualSorting={manualSorting}
          pageCount={pageCount}
        />
      )}

      {/* Pagination */}
      {pagination && (
        <Pagination
          page={pagination.page}
          limit={pagination.pageSize}
          total={pagination.total}
          totalPages={pageCount || 1}
          onPageChange={pagination.onPageChange}
          onLimitChange={pagination.onPageSizeChange}
        />
      )}
    </div>
  );
}
