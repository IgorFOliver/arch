'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { Ban, CircleCheck, Pencil, Plus } from 'lucide-react';

import { Button, Badge, DataTable, DataTableFeatures } from '@4basearch/ui';

import { useTenants } from '@/features/tenants/hooks/use-tenants';
import { useSetTenantStatus } from '@/features/tenants/hooks/use-set-tenant-status';
import type { Tenant } from '@/features/tenants/domain/tenant';
import { useDictionary } from '@/shared/lib/i18n/use-dictionary';

const PAGE_SIZE = 20;

export function TenantsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);

  const tenantsQuery = useTenants({ page, pageSize: PAGE_SIZE });
  const setStatusMutation = useSetTenantStatus();

  const setPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams);
    if (nextPage <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(nextPage));
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const dict = useDictionary();
  const t = dict.tenants.table;

  const columns: ColumnDef<DataTableFeatures, Tenant, unknown>[] = [
    { accessorKey: 'name', header: t.name },
    { accessorKey: 'slug', header: t.slug },
    {
      accessorKey: 'status',
      header: t.status,
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === 'ACTIVE' ? 'success' : 'danger'}
        >
          {row.original.status === 'ACTIVE' ? t.active : t.suspended}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: t.actions,
      cell: ({ row }) => {
        const tenant = row.original;
        const isActive = tenant.status === 'ACTIVE';

        return (
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={t.edit}
              onClick={() => router.push(`/tenants/${tenant.id}/edit`)}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={isActive ? t.suspend : t.activate}
              onClick={() =>
                setStatusMutation.mutate({
                  id: tenant.id,
                  status: isActive ? 'SUSPENDED' : 'ACTIVE',
                })
              }
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {isActive ? (
                <Ban className="h-4 w-4" />
              ) : (
                <CircleCheck className="h-4 w-4" />
              )}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          {dict.tenants.title}
        </h1>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => router.push('/tenants/new')}
        >
          {dict.tenants.createButton}
        </Button>
      </div>

      {tenantsQuery.isError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {dict.tenants.errors.loadTenantsFailed}
        </div>
      )}

      <DataTable
        columns={columns}
        data={tenantsQuery.data?.tenants ?? []}
        pagination={{ pageIndex: page - 1, pageSize: PAGE_SIZE }}
        onPaginationChange={(next) => setPage(next.pageIndex + 1)}
        pageCount={tenantsQuery.data?.meta.totalPages ?? 1}
        noResultsLabel={t.noResults}
        previousLabel={t.previous}
        nextLabel={t.next}
        pageLabel={(current, total) =>
          `${t.pagePrefix} ${current} ${t.pageSeparator} ${total}`
        }
      />
    </>
  );
}
