import { useEffect, useState } from "react";

export const useBeamLink = (options: {
  linkToken: string;
  onSuccess: (publicToken: string) => void;
  onExit: () => void;
}) => {
  const [error, setError] = useState<string | null>(null);
  let [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    if (options.linkToken) {
      setReady(true);
    }
  }, [options.linkToken]);

  const handleEvent = (e: {
    data: { eventName: string; publicToken: string };
  }) => {
    console.log(e.data, "e.data");
    if (e?.data?.eventName === "beamIframeClose") {
      options.onExit();
      closeModal();
    } else if (e?.data?.eventName === "beamIframeCloseOnSuccess") {
      options.onSuccess(e?.data?.publicToken);
      closeModal();
    }
  };

  const openModal = () => {
    const overlayFrame = document.querySelector(".beam-overlay") as HTMLElement;
    const beamIframe = document.querySelector(".beam-iframe") as HTMLElement;
    overlayFrame.style.display =
      overlayFrame.style.display === "none" ? "block" : "none";
    beamIframe.style.display =
      beamIframe.style.display === "none" ? "block" : "none";
  };

  const closeModal = () => {
    const overlayFrame = document.querySelector(".beam-overlay") as HTMLElement;
    const beamIframe = document.querySelector(".beam-iframe") as HTMLElement;
    overlayFrame.style.display = "none";
    beamIframe.style.display = "none";
  };

  const insertModal = () => {
    const iframe = document.createElement("iframe", {});
    iframe.classList.add("beam-iframe");
    iframe.src = `${process.env.REACT_APP_BEAM_URL}/embedded?linkToken=${options.linkToken}`;
    iframe.name = Date.now().toString();
    iframe.style.display = "none";
    iframe.style.position = "fixed";
    iframe.style.inset = "0px";
    iframe.style.zIndex = "2147483647";
    iframe.style.borderWidth = "0px";
    iframe.style.overflow = "hidden auto";
    iframe.style.backgroundColor = "#fff";
    iframe.style.height = "600px";
    iframe.style.width = "400px";
    iframe.style.left = "calc(50% - 200px)";
    iframe.style.top = "calc(50% - 300px)";

    const overlay = document.createElement("div", {});
    overlay.classList.add("beam-overlay");
    overlay.style.height = "100%";
    overlay.style.left = "0";
    overlay.style.opacity = "1";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.width = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    overlay.style.backdropFilter = "blur(2px)";
    overlay.style.display = "none";
    overlay.appendChild(iframe);
    document.body.appendChild(overlay);
    setReady(true);
  };

  const removeModal = () => {
    const overlayFrame = document.querySelector(".beam-overlay") as HTMLElement;
    const beamIframe = document.querySelector(".beam-iframe") as HTMLElement;

    overlayFrame.parentNode?.removeChild(overlayFrame);
    beamIframe.parentNode?.removeChild(beamIframe);
  };

  useEffect(() => {
    if (!options.linkToken) {
      setReady(false);
      return;
    }
    insertModal();

    window.addEventListener("message", handleEvent);

    return () => {
      window.removeEventListener("message", handleEvent);
      removeModal();
    };
  }, [options.linkToken]);

  const open = () => {
    document.cookie = "name=accessToken; expires=Sat, 20 Jan 1980 12:00:00 UTC";
    if (!options.linkToken) {
      console.warn(
        "You cannot call open() without a valid token supplied to useBeamLink"
      );
      return;
    }

    openModal();
  };

  return {
    error,
    ready,
    exit: closeModal,
    open: open,
  };
};
