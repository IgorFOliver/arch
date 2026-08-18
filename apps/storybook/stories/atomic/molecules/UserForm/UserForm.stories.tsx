import type { Meta, StoryObj } from '@storybook/react';
import { UserForm } from './UserForm';

const roleOptions = [
  { value: 'USER', label: 'User' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
];

const meta = {
  title: 'atomic/Molecules/UserForm',
  component: UserForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    title: 'New user',
    submitLabel: 'Create user',
    nameLabel: 'Name',
    companyLabel: 'Company',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    roleLabel: 'Role',
    roleOptions,
    role: 'USER',
  },
  argTypes: {
    isLoading: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof UserForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Create: Story = {};

export const Edit: Story = {
  args: {
    title: 'Edit user',
    submitLabel: 'Save changes',
    passwordLabel: undefined,
    role: 'ADMIN',
    emailInputProps: { disabled: true, defaultValue: 'jane@example.com' },
    nameInputProps: { defaultValue: 'Jane Doe' },
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const ValidationErrors: Story = {
  args: {
    nameError: 'Name is required.',
    emailError: 'Please enter a valid email address.',
    passwordError: 'Password must be at least 8 characters.',
  },
};

export const ServerError: Story = {
  args: {
    error: 'A user with this email already exists.',
  },
};
