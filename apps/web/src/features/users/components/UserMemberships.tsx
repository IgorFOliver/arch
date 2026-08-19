'use client';

import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';

import { Button } from '@ui/atoms/Button/Button';
import { Badge } from '@ui/atoms/Badge/Badge';
import { FormField } from '@ui/molecules/FormField/FormField';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/molecules/Select/Select';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ui/molecules/Dialog/Dialog';

import { useTenants } from '@/features/tenants/hooks/use-tenants';
import { useUserMemberships } from '@/features/users/hooks/use-user-memberships';
import { useAddUserMembership } from '@/features/users/hooks/use-add-user-membership';
import { useDeleteUserMembership } from '@/features/users/hooks/use-delete-user-membership';
import { resolveUsersErrorMessage } from '@/features/users/resolve-users-error';
import type { UserMembership } from '@/features/users/domain/user-membership';
import { useDictionary } from '@/shared/lib/i18n/use-dictionary';
import type { Role } from '@4basearch/domain-types';

interface UserMembershipsProps {
  userId: string;
}

export function UserMemberships({ userId }: UserMembershipsProps) {
  const dict = useDictionary();
  const t = dict.users.memberships;

  const membershipsQuery = useUserMemberships(userId);
  const activeTenantsQuery = useTenants({
    page: 1,
    pageSize: 100,
    status: 'ACTIVE',
  });

  const roleOptions = useMemo(
    () =>
      Object.entries(dict.shell.roles)
        .filter(([value]) => value !== 'PLATFORM_ADMIN')
        .map(([value, label]) => ({ value, label })),
    [dict.shell.roles],
  );

  const tenantOptions = useMemo(
    () =>
      (activeTenantsQuery.data?.tenants ?? []).map((tenant) => ({
        value: tenant.id,
        label: tenant.name,
      })),
    [activeTenantsQuery.data],
  );

  const [tenantId, setTenantId] = useState('');
  const [role, setRole] = useState('');
  const [membershipToDelete, setMembershipToDelete] =
    useState<UserMembership | null>(null);

  const addMutation = useAddUserMembership();
  const deleteMutation = useDeleteUserMembership();

  const addErrorMessage = addMutation.isError
    ? resolveUsersErrorMessage(
        addMutation.error,
        t.errors,
        'addMembershipFailed',
      )
    : undefined;
  const deleteErrorMessage = deleteMutation.isError
    ? resolveUsersErrorMessage(
        deleteMutation.error,
        t.errors,
        'deleteMembershipFailed',
      )
    : undefined;

  const handleAdd = () => {
    if (!tenantId || !role) return;
    addMutation.mutate(
      { userId, input: { tenantId, role: role as Role } },
      {
        onSuccess: () => {
          setTenantId('');
          setRole('');
        },
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!membershipToDelete) return;
    deleteMutation.mutate(
      { userId, membershipId: membershipToDelete.id },
      { onSuccess: () => setMembershipToDelete(null) },
    );
  };

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">{t.title}</h2>

      {membershipsQuery.isError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {t.errors.loadMembershipsFailed}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                {t.table.tenant}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                {t.table.role}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                {t.table.status}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                {t.table.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(membershipsQuery.data?.length ?? 0) === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-3 text-center text-gray-400">
                  {t.table.noResults}
                </td>
              </tr>
            )}
            {membershipsQuery.data?.map((membership) => (
              <tr key={membership.id}>
                <td className="px-4 py-3 text-gray-700">
                  {membership.tenantName}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {dict.shell.roles[membership.role]}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      membership.status === 'ACTIVE' ? 'success' : 'danger'
                    }
                  >
                    {membership.status === 'ACTIVE'
                      ? t.table.active
                      : t.table.revoked}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    aria-label={t.table.remove}
                    onClick={() => setMembershipToDelete(membership)}
                    className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {addErrorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {addErrorMessage}
        </div>
      )}

      <div className="flex items-end gap-3">
        <FormField label={t.form.tenantLabel} htmlFor="membership-tenant">
          <Select value={tenantId} onValueChange={setTenantId}>
            <SelectTrigger id="membership-tenant">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tenantOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label={t.form.roleLabel} htmlFor="membership-add-role">
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="membership-add-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <Button
          type="button"
          disabled={!tenantId || !role}
          isLoading={addMutation.isPending}
          onClick={handleAdd}
        >
          {t.addButton}
        </Button>
      </div>

      <Dialog
        open={membershipToDelete !== null}
        onOpenChange={(open) => !open && setMembershipToDelete(null)}
      >
        <DialogContent closeLabel={t.deleteDialog.closeLabel}>
          <DialogHeader>
            <DialogTitle>{t.deleteDialog.title}</DialogTitle>
            <DialogDescription>{t.deleteDialog.description}</DialogDescription>
          </DialogHeader>

          {deleteErrorMessage && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {deleteErrorMessage}
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                {t.deleteDialog.cancelLabel}
              </Button>
            </DialogClose>
            <Button
              type="button"
              isLoading={deleteMutation.isPending}
              onClick={handleConfirmDelete}
            >
              {t.deleteDialog.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
