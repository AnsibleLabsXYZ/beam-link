import React from "react";

import { useBeamLink } from "../useBeamLink";

export interface UseBeamLinkProps {
  linkToken: string;
}

/**
 * Primary UI component for user interaction
 */
export const UseBeamLink = ({ linkToken }: UseBeamLinkProps) => {
  // make api call here
  const { ready, open } = useBeamLink({
    linkToken: linkToken,
    onSuccess: (publicToken: string) => {
      console.log("user public token", publicToken);
      // call into their backend 4419832c-8ee8-4359-ba9f-470f734a0cad
    },
    onExit: () => {
      console.log("dialog closed");
    },
  });

  console.log(ready, "ready");

  const onclick = () => {
    console.log("ready", ready);
    console.log("open", open());
  };

  return (
    <button type="button" onClick={onclick}>
      Start Cashing Out
    </button>
  );
};
