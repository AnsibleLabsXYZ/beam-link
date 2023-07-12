/// <reference types="react" />
import type { StoryObj } from "@storybook/react";
import { UseBeamLinkProps } from "./UseBeamLink";
declare const meta: {
    title: string;
    component: ({ linkToken }: UseBeamLinkProps) => import("react").JSX.Element;
    tags: string[];
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Primary: Story;
