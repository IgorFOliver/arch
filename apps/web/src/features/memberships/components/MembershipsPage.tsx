'use client';

import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { Ban, CircleCheck, Pencil, Plus } from 'lucide-react';

import { Button } from '@ui/atoms/Button/Button';
import { Badge } from '@ui/atoms/Badge/Badge';
import {
  DataTable,
  DataTableFeatures,
} from '@ui/organisms/DataTable/DataTable';

import { useMemberships } from '@/features/memberships/hooks/use-memberships';
import { useSetMembershipStatus } from '@/features/memberships/hooks/use-set-membership-status';
import type { Membership } from '@/features/memberships/domain/membership';
import { useDictionary } from '@/shared/lib/i18n/use-dictionary';

export function MembershipsPage() {
  const router = useRouter();

  const membershipsQuery = useMemberships();
  const setStatusMutation = useSetMembershipStatus();

  const dict = useDictionary();
  const t = dict.memberships.table;

  const columns: ColumnDef<DataTableFeatures, Membership, unknown>[] = [
    {
      accessorKey: 'userEmail',
      header: t.user,
      cell: ({ row }) => row.original.userName ?? row.original.userEmail,
    },
    {
      accessorKey: 'role',
      header: t.role,
      cell: ({ row }) => dict.shell.roles[row.original.role],
    },
    {
      accessorKey: 'status',
      header: t.status,
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === 'ACTIVE' ? 'success' : 'danger'}
        >
          {row.original.status === 'ACTIVE' ? t.active : t.revoked}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: t.actions,
      cell: ({ row }) => {
        const membership = row.original;
        const isActive = membership.status === 'ACTIVE';

        return (
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={t.edit}
              disabled={!isActive}
              onClick={() => router.push(`/memberships/${membership.id}/edit`)}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={isActive ? t.revoke : t.reactivate}
              onClick={() =>
                setStatusMutation.mutate({
                  id: membership.id,
                  status: isActive ? 'REVOKED' : 'ACTIVE',
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
          {dict.memberships.title}
        </h1>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => router.push('/memberships/new')}
        >
          {dict.memberships.createButton}
        </Button>
      </div>

      {membershipsQuery.isError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {dict.memberships.errors.loadMembershipsFailed}
        </div>
      )}

      <DataTable
        columns={columns}
        data={membershipsQuery.data?.memberships ?? []}
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
