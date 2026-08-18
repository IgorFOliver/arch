import type { Meta, StoryObj } from '@storybook/react';
import { SignupForm } from './SignupForm';

const meta = {
  title: 'atomic/Molecules/SignupForm',
  component: SignupForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    title: 'Create your account',
    submitLabel: 'Create my account',
    nameLabel: 'Name',
    companyLabel: 'Company',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    agreeToTermsLabel: 'I agree to the Terms of Service and Privacy Policy',
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
    nameError: {
      control: 'text',
    },
    companyError: {
      control: 'text',
    },
    emailError: {
      control: 'text',
    },
    passwordError: {
      control: 'text',
    },
    agreeToTermsError: {
      control: 'text',
    },
  },
} satisfies Meta<typeof SignupForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

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
    agreeToTermsError: 'You must agree to the terms to continue.',
  },
};

export const ServerError: Story = {
  args: {
    error: 'An account with this email already exists.',
  },
};
