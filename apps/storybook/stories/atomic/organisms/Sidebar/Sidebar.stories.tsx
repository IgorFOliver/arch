import type { Meta, StoryObj } from '@storybook/react';
import {
  Briefcase,
  Heart,
  LayoutDashboard,
  MessageSquare,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { Sidebar, SidebarSectionData } from './Sidebar';

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
  title: 'atomic/Organisms/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    user: { name: 'David Dev', role: 'Creative Director' },
    sections,
    activeHref: '/dashboards',
    onSettingsClick: () => {},
    settingsLabel: 'Settings',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '700px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutProfile: Story = {
  args: {
    user: undefined,
  },
};
