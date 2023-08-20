declare enum BEAM_ENVIRONMENT {
    DEVELOPMENT = "https://beam.dev.ansiblelabs.xyz",
    PRODUCTION = "https://app.beam.ansiblelabs.xyz"
}
declare const useBeamLink: (options: {
    environment: BEAM_ENVIRONMENT;
    linkToken: string | null;
    onSuccess: (publicToken: string) => void;
    onExit: () => void;
}) => {
    error: string | null;
    ready: boolean;
    exit: () => void;
    open: () => void;
};

export { BEAM_ENVIRONMENT, useBeamLink };
