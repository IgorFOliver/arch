import { apiFetch, HttpError } from '@/infrastructure/api/http-client';
import type { Membership, MembershipMutationResult } from './domain/membership';
import {
  listMembershipsResponseSchema,
  membershipResponseSchema,
  membershipMutationResponseSchema,
  type CreateMembershipInput,
  type ListMembershipsResponse,
  type MembershipsErrorCode,
  type UpdateMembershipInput,
} from './memberships-api.types';

// Tenant-scoped, like /users — the backend resolves the tenant from the
// session's TenantContext, never from anything this client sends.
const BASE_PATH = '/memberships';

export class MembershipsApiError extends Error {
  constructor(
    public readonly code: MembershipsErrorCode,
    public readonly status?: number,
  ) {
    super(code);
    this.name = 'MembershipsApiError';
  }
}

async function withMembershipsApiError<T>(
  fallback: MembershipsErrorCode,
  statusCodeMap: Partial<Record<number, MembershipsErrorCode>>,
  action: () => Promise<T>,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof HttpError) {
      throw new MembershipsApiError(
        statusCodeMap[error.status] ?? fallback,
        error.status,
      );
    }
    throw new MembershipsApiError(fallback);
  }
}

export function listMemberships(): Promise<ListMembershipsResponse> {
  return withMembershipsApiError('loadMembershipsFailed', {}, async () => {
    const response = await apiFetch<ListMembershipsResponse>(BASE_PATH);
    return listMembershipsResponseSchema.parse(response);
  });
}

export function getMembership(id: string): Promise<Membership> {
  return withMembershipsApiError(
    'loadMembershipsFailed',
    { 404: 'membershipNotFound' },
    async () => {
      const response = await apiFetch<{ membership: unknown }>(
        `${BASE_PATH}/${id}`,
      );
      return membershipResponseSchema.parse(response).membership;
    },
  );
}

export function createMembership(
  input: CreateMembershipInput,
): Promise<MembershipMutationResult> {
  return withMembershipsApiError(
    'createMembershipFailed',
    { 404: 'userNotFound', 409: 'membershipAlreadyExists' },
    async () => {
      const response = await apiFetch<{ membership: unknown }>(BASE_PATH, {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return membershipMutationResponseSchema.parse(response).membership;
    },
  );
}

export function updateMembership(
  id: string,
  input: UpdateMembershipInput,
): Promise<MembershipMutationResult> {
  return withMembershipsApiError(
    'updateMembershipFailed',
    { 404: 'membershipNotFound' },
    async () => {
      const response = await apiFetch<{ membership: unknown }>(
        `${BASE_PATH}/${id}`,
        { method: 'PATCH', body: JSON.stringify(input) },
      );
      return membershipMutationResponseSchema.parse(response).membership;
    },
  );
}

export function revokeMembership(
  id: string,
): Promise<MembershipMutationResult> {
  return withMembershipsApiError(
    'statusUpdateFailed',
    { 404: 'membershipNotFound' },
    async () => {
      const response = await apiFetch<{ membership: unknown }>(
        `${BASE_PATH}/${id}`,
        { method: 'DELETE' },
      );
      return membershipMutationResponseSchema.parse(response).membership;
    },
  );
}

export function reactivateMembership(
  id: string,
): Promise<MembershipMutationResult> {
  return withMembershipsApiError(
    'statusUpdateFailed',
    { 404: 'membershipNotFound' },
    async () => {
      const response = await apiFetch<{ membership: unknown }>(
        `${BASE_PATH}/${id}/reactivate`,
        { method: 'POST' },
      );
      return membershipMutationResponseSchema.parse(response).membership;
    },
  );
}
