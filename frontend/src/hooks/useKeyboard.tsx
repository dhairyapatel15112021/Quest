import { useEffect } from 'react';

interface KeyboardActions {
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    dependencies?: any[];
}

export const useKeyboard = ({
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    dependencies = []
}: KeyboardActions) => {
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {

            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                event.preventDefault();
            }

            switch (event.key) {
                case 'ArrowUp':
                    onArrowUp?.();
                    break;
                case 'ArrowDown':
                    onArrowDown?.();
                    break;
                case 'ArrowLeft':
                    onArrowLeft?.();
                    break;
                case 'ArrowRight':
                    onArrowRight?.();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, dependencies);
};
