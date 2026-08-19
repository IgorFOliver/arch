import type { Meta, StoryObj } from '@storybook/react';
import {
  Briefcase,
  Heart,
  LayoutDashboard,
  MessageSquare,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { AdminLayout, SidebarSectionData } from '@4basearch/ui';

const sections: SidebarSectionData[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboards', href: '/dashboards', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Apps',
    items: [
      {
        label: 'Ecommerce',
        icon: ShoppingBag,
        items: [
          { label: 'Products', href: '/ecommerce/products' },
          { label: 'Orders', href: '/ecommerce/orders' },
        ],
      },
      { label: 'Chat', href: '/chat', icon: MessageSquare },
      { label: 'Projects', href: '/projects', icon: Briefcase },
      { label: 'CRM', href: '/crm', icon: Heart },
      { label: 'Users', href: '/users', icon: Users },
    ],
  },
];

const meta = {
  title: 'atomic/templates/AdminLayout',
  component: AdminLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    sidebarProps: {
      user: { name: 'David Dev', role: 'Creative Director' },
      sections,
      activeHref: '/dashboards',
      onSettingsClick: () => {},
      settingsLabel: 'Settings',
    },
    topbarProps: {
      language: 'en',
      languages: [
        { code: 'en', label: 'English' },
        { code: 'pt', label: 'Português' },
      ],
      notificationsLabel: 'Notifications',
      languageSwitcherLabel: 'Change language',
      logoutLabel: 'Log out',
      notificationCount: 5,
    },
    children: (
      <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
    ),
  },
} satisfies Meta<typeof AdminLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
