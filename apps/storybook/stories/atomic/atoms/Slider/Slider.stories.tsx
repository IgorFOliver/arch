import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Slider, SliderProps } from '@4basearch/ui';

function ControlledSlider(props: SliderProps) {
  const [value, setValue] = useState(props.value);

  return <Slider {...props} value={value} onChange={setValue} />;
}

const meta = {
  title: 'atomic/Atoms/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    value: 30,
    min: 0,
    max: 100,
    step: 1,
    formatValue: (value: number) => `${value}cm`,
    'aria-label': 'Slider value',
  },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    sliderSize: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    fullWidth: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    showValue: {
      control: 'boolean',
    },
  },
  render: (args) => <ControlledSlider {...args} />,
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  args: {
    sliderSize: 'sm',
    value: 15,
  },
};

export const Large: Story = {
  args: {
    sliderSize: 'lg',
    value: 70,
  },
};

export const AlphanumericLabel: Story = {
  name: 'Alphanumeric label',
  args: {
    value: 2,
    min: 0,
    max: 3,
    step: 1,
    formatValue: (value: number) => ['P', 'M', 'G', 'GG'][value] ?? `${value}`,
    'aria-label': 'Size',
  },
};

export const WithoutValueLabel: Story = {
  name: 'Without value label',
  args: {
    showValue: false,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 45,
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};
