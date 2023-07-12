export declare const useBeamLink: (options: {
    linkToken: string;
    onSuccess: (publicToken: string) => void;
    onExit: () => void;
}) => {
    error: string | null;
    ready: boolean;
    exit: () => void;
    open: () => void;
};
