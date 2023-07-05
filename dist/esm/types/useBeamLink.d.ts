export declare const useBeamLink: (options: {
    name: string;
}) => {
    error: string | null;
    ready: boolean;
    exit: () => void;
    open: () => void;
};
