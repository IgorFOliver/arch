'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { Ban, CircleCheck, Pencil, Plus } from 'lucide-react';

import { Button } from '@ui/atoms/Button/Button';
import { Badge } from '@ui/atoms/Badge/Badge';
import {
  DataTable,
  DataTableFeatures,
} from '@ui/organisms/DataTable/DataTable';

import { useSession } from '@/features/auth';
import { useUsers } from '@/features/users/hooks/use-users';
import { useUpdateUser } from '@/features/users/hooks/use-update-user';
import type { ManagedUser } from '@/features/users/domain/user';
import { useDictionary } from '@/shared/lib/i18n/use-dictionary';

const PAGE_SIZE = 20;

export function UsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user: currentUser } = useSession();

  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);

  const usersQuery = useUsers({ page, pageSize: PAGE_SIZE });
  const updateUserMutation = useUpdateUser();

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
  const t = dict.users.table;

  const columns: ColumnDef<DataTableFeatures, ManagedUser, unknown>[] = [
    {
      accessorKey: 'name',
      header: t.name,
      cell: ({ row }) => row.original.name ?? row.original.email,
    },
    { accessorKey: 'email', header: t.email },
    {
      accessorKey: 'active',
      header: t.status,
      cell: ({ row }) => (
        <Badge variant={row.original.active ? 'success' : 'danger'}>
          {row.original.active ? t.active : t.inactive}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: t.actions,
      cell: ({ row }) => {
        const rowUser = row.original;
        const isSelf = rowUser.id === currentUser?.id;

        return (
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={t.edit}
              onClick={() => router.push(`/users/${rowUser.id}/edit`)}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={rowUser.active ? t.block : t.unblock}
              disabled={isSelf}
              onClick={() =>
                updateUserMutation.mutate({
                  id: rowUser.id,
                  input: { active: !rowUser.active },
                })
              }
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {rowUser.active ? (
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
          {dict.users.title}
        </h1>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => router.push('/users/new')}
        >
          {dict.users.createButton}
        </Button>
      </div>

      {usersQuery.isError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {dict.users.errors.loadUsersFailed}
        </div>
      )}

      <DataTable
        columns={columns}
        data={usersQuery.data?.users ?? []}
        pagination={{ pageIndex: page - 1, pageSize: PAGE_SIZE }}
        onPaginationChange={(next) => setPage(next.pageIndex + 1)}
        pageCount={usersQuery.data?.meta.totalPages ?? 1}
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
