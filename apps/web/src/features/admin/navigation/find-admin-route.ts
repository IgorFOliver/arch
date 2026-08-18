import {
  adminNavigation,
  adminNavigationSectionKeys,
  type AdminNavigationItem,
} from './admin-navigation';

function matchesRoute(pathname: string, href: string): boolean {
  const hrefSegments = href.split('/').filter(Boolean);
  const pathSegments = pathname.split('/').filter(Boolean);

  if (pathSegments.length < hrefSegments.length) {
    return false;
  }

  return hrefSegments.every(
    (segment, index) => segment === pathSegments[index],
  );
}

/**
 * Resolves the admin navigation item that owns a pathname, including its
 * child routes (e.g. "/users" owns "/users/123/edit"). Segment-by-segment
 * comparison avoids false positives between sibling routes such as
 * "/users" and "/users-settings". When multiple items match (nested
 * features), the most specific (longest) href wins.
 */
export function findAdminRoute(
  pathname: string,
): AdminNavigationItem | undefined {
  const items = adminNavigationSectionKeys.flatMap(
    (sectionKey) => adminNavigation[sectionKey],
  );

  return items
    .filter((item) => matchesRoute(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
}
