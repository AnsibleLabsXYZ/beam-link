import type { Meta, StoryObj } from "@storybook/react";

import { UseBeamLink, UseBeamLinkProps } from "./UseBeamLink";

const meta = {
  title: "Example/UseBeamLink",
  component: UseBeamLink,
  tags: ["autodocs"],
} satisfies Meta<UseBeamLinkProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    linkToken: "",
  },
};
