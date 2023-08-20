import { useState, useEffect } from 'react';

var BEAM_ENVIRONMENT;
(function (BEAM_ENVIRONMENT) {
    BEAM_ENVIRONMENT["DEVELOPMENT"] = "https://beam.dev.ansiblelabs.xyz";
    BEAM_ENVIRONMENT["PRODUCTION"] = "https://app.beam.ansiblelabs.xyz";
})(BEAM_ENVIRONMENT || (BEAM_ENVIRONMENT = {}));
const useBeamLink = (options) => {
    const [error, setError] = useState(null);
    let [ready, setReady] = useState(false);
    useEffect(() => {
        if (options.linkToken) {
            setReady(true);
        }
    }, [options.linkToken]);
    const handleEvent = (e) => {
        var _a, _b, _c;
        if (((_a = e === null || e === void 0 ? void 0 : e.data) === null || _a === void 0 ? void 0 : _a.eventName) === "beamIframeClose") {
            options.onExit();
            closeModal();
        }
        else if (((_b = e === null || e === void 0 ? void 0 : e.data) === null || _b === void 0 ? void 0 : _b.eventName) === "beamIframeCloseOnSuccess") {
            options.onSuccess((_c = e === null || e === void 0 ? void 0 : e.data) === null || _c === void 0 ? void 0 : _c.publicToken);
            closeModal();
        }
    };
    const openModal = () => {
        const overlayFrame = document.querySelector(".beam-overlay");
        const beamIframe = document.querySelector(".beam-iframe");
        overlayFrame.style.display =
            overlayFrame.style.display === "none" ? "block" : "none";
        beamIframe.style.display =
            beamIframe.style.display === "none" ? "block" : "none";
    };
    const closeModal = () => {
        const overlayFrame = document.querySelector(".beam-overlay");
        const beamIframe = document.querySelector(".beam-iframe");
        overlayFrame.style.display = "none";
        beamIframe.style.display = "none";
    };
    const insertModal = () => {
        const iframe = document.createElement("iframe", {});
        iframe.classList.add("beam-iframe");
        iframe.src = `${options.environment}/embedded?linkToken=${options.linkToken}`;
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
        var _a, _b;
        const overlayFrame = document.querySelector(".beam-overlay");
        const beamIframe = document.querySelector(".beam-iframe");
        (_a = overlayFrame.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(overlayFrame);
        (_b = beamIframe.parentNode) === null || _b === void 0 ? void 0 : _b.removeChild(beamIframe);
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
        if (!options.linkToken) {
            console.warn("You cannot call open() without a valid token supplied to useBeamLink");
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

export { BEAM_ENVIRONMENT, useBeamLink };
