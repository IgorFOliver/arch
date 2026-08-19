import type { Meta, StoryObj } from '@storybook/react';
import { LoginForm } from '@4basearch/ui';

const meta = {
  title: 'atomic/Molecules/LoginForm',
  component: LoginForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    title: 'Sign in',
    submitLabel: 'Sign in',
    emailLabel: 'Email',
    passwordLabel: 'Password',
  },
  argTypes: {
    isLoading: {
      control: 'boolean',
    },
    title: {
      control: 'text',
    },
    submitLabel: {
      control: 'text',
    },
    error: {
      control: 'text',
    },
    emailError: {
      control: 'text',
    },
    passwordError: {
      control: 'text',
    },
  },
} satisfies Meta<typeof LoginForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const EmailError: Story = {
  args: {
    emailError: 'Please enter a valid email address.',
  },
};

export const PasswordError: Story = {
  args: {
    passwordError: 'Password must be at least 8 characters.',
  },
};

export const ValidationErrors: Story = {
  args: {
    emailError: 'Please enter a valid email address.',
    passwordError: 'Password is required.',
  },
};

export const ServerError: Story = {
  args: {
    error: 'Invalid email or password.',
  },
};
