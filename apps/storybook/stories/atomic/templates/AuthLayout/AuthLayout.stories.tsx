import type { Meta, StoryObj } from '@storybook/react';
import { AuthLayout } from './AuthLayout';
import { LoginForm } from '../../molecules/LoginForm/LoginForm';
import { SignupForm } from '../../molecules/SignupForm/SignupForm';

const meta = {
  title: 'atomic/templates/AuthLayout',
  component: AuthLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AuthLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithLogin: Story = {
  render: () => (
    <AuthLayout>
      <LoginForm
        title="Sign in"
        submitLabel="Sign in"
        emailLabel="Email"
        passwordLabel="Password"
      />
    </AuthLayout>
  ),
};

export const WithSignup: Story = {
  render: () => (
    <AuthLayout>
      <SignupForm
        title="Create your account"
        submitLabel="Create my account"
        nameLabel="Name"
        companyLabel="Company"
        emailLabel="Email"
        passwordLabel="Password"
        agreeToTermsLabel="I agree to the Terms of Service and Privacy Policy"
      />
    </AuthLayout>
  ),
};
