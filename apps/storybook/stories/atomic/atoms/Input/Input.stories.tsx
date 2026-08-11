import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta = {
  title: "atomic/Atoms/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    placeholder: "Enter your name",
  },
  argTypes: {
    inputSize: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    fullWidth: {
      control: "boolean",
    },
    error: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search", "tel", "url"],
    },
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    value: "John Doe",
  },
};

export const Small: Story = {
  args: {
    inputSize: "sm",
    placeholder: "Small input",
  },
};

export const Large: Story = {
  args: {
    inputSize: "lg",
    placeholder: "Large input",
  },
};

export const Email: Story = {
  args: {
    type: "email",
    placeholder: "you@example.com",
  },
};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Enter your password",
  },
};

export const Error: Story = {
  args: {
    error: true,
    placeholder: "Invalid value",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "Disabled input",
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    placeholder: "Full width input",
  },
  parameters: {
    layout: "padded",
  },
};
