import type { Meta, StoryObj } from '@storybook/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@4basearch/ui';

const meta = {
  title: 'atomic/Molecules/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select defaultValue="bookcases">
      <SelectTrigger className="w-56" aria-label="Category">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="bookcases">Bookcases</SelectItem>
        <SelectItem value="storage">Storage</SelectItem>
        <SelectItem value="seating">Seating</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Placeholder: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-56" aria-label="Category">
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="bookcases">Bookcases</SelectItem>
        <SelectItem value="storage">Storage</SelectItem>
        <SelectItem value="seating">Seating</SelectItem>
      </SelectContent>
    </Select>
  ),
};
