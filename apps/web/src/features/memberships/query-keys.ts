export const membershipsKeys = {
  all: () => ['memberships'] as const,
  lists: () => [...membershipsKeys.all(), 'list'] as const,
  details: () => [...membershipsKeys.all(), 'detail'] as const,
  detail: (id: string) => [...membershipsKeys.details(), id] as const,
};
