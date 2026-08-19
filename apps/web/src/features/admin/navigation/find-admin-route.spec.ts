import { findAdminRoute } from './find-admin-route';

describe('findAdminRoute', () => {
  it('resolves the home route for the root path', () => {
    expect(findAdminRoute('/')?.href).toBe('/');
  });

  it('resolves the users route for its exact path', () => {
    expect(findAdminRoute('/users')?.href).toBe('/users');
  });

  it('resolves the users route for a nested child path', () => {
    expect(findAdminRoute('/users/123/edit')?.href).toBe('/users');
  });

  it('does not match a sibling route that merely shares a prefix', () => {
    expect(findAdminRoute('/users-settings')?.href).toBe('/');
  });
});
