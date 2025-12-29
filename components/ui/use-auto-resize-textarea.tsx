import * as React from "react";

interface UseAutoResizeTextareaProps {
    minHeight?: number;
    maxHeight?: number;
}

export function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps = {}) {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const adjustHeight = React.useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = minHeight ? `${minHeight}px` : "auto";
                return;
            }

            textarea.style.height = minHeight ? `${minHeight}px` : "auto";
            const newHeight = textarea.scrollHeight;

            if (maxHeight && newHeight > maxHeight) {
                textarea.style.height = `${maxHeight}px`;
            } else {
                textarea.style.height = `${newHeight}px`;
            }
        },
        [minHeight, maxHeight],
    );

    React.useEffect(() => {
        // Adjust on mount and value changes if we had access to value, 
        // but here we expose adjustHeight for the consumer to call on change.
        // We can also try to adjust on mount.
        adjustHeight();
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}
