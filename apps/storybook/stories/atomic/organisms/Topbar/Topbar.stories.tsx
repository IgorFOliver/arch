import type { Meta, StoryObj } from '@storybook/react';
import { Topbar } from './Topbar';

const meta = {
  title: 'atomic/Organisms/Topbar',
  component: Topbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
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
} satisfies Meta<typeof Topbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoNotifications: Story = {
  args: {
    notificationCount: 0,
  },
};

export const Portuguese: Story = {
  args: {
    language: 'pt',
  },
};
