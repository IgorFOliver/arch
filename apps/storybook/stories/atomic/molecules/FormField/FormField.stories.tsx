import type { Meta, StoryObj } from "@storybook/react";
import { FormField } from "./FormField";
import { Input } from "../../atoms/Input/Input";

const meta = {
  title: "atomic/molecules/FormField",
  component: FormField,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    label: {
      control: "text",
    },
    error: {
      control: "text",
    },
    helperText: {
      control: "text",
    },
    required: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof FormField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Email",
    htmlFor: "email",
    children: <Input id="email" type="email" placeholder="you@example.com" />,
  },
};

export const Required: Story = {
  args: {
    label: "Email",
    htmlFor: "email",
    required: true,
    children: <Input id="email" type="email" placeholder="you@example.com" />,
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Email",
    htmlFor: "email",
    helperText: "We'll never share your email.",
    children: <Input id="email" type="email" placeholder="you@example.com" />,
  },
};

export const WithError: Story = {
  args: {
    label: "Email",
    htmlFor: "email",
    error: "Please enter a valid email address.",
    children: (
      <Input id="email" type="email" placeholder="you@example.com" error />
    ),
  },
};
