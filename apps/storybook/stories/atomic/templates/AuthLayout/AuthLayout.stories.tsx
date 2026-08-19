import type { Meta, StoryObj } from '@storybook/react';
import { AuthLayout } from './AuthLayout';
import { Button } from '../../atoms/Button/Button';
import { Input } from '../../atoms/Input/Input';
import { FormField } from '../../molecules/FormField/FormField';

const meta = {
  title: 'atomic/templates/AuthLayout',
  component: AuthLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    children: (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>

        <div className="space-y-4">
          <FormField label="Email" htmlFor="email" required>
            <Input id="email" type="email" autoComplete="email" fullWidth />
          </FormField>

          <FormField label="Password" htmlFor="password" required>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              fullWidth
            />
          </FormField>
        </div>

        <Button type="submit" fullWidth>
          Sign in
        </Button>
      </div>
    ),
  },
} satisfies Meta<typeof AuthLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithForm: Story = {};
