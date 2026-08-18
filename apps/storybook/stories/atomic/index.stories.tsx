import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Atomic/Welcome',
  parameters: {
    docs: {
      description: {
        component: 'Initial structure of Atomic Design for Storybook.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Welcome: Story = {};
