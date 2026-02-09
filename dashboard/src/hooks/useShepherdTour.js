import { useShepherd } from 'react-shepherd';
import { useMemo, useEffect } from 'react';

/**
 * Custom Hook: useShepherdTour
 * Encapsulates the logic for creating a Shepherd tour instance.
 * Follows the "Custom hooks pattern" for better reusability and clean code.
 */
export const useShepherdTour = ({ tourOptions, steps }) => {
    const Shepherd = useShepherd();

    const tourInstance = useMemo(() => {
        if (!Shepherd) return null;

        const tour = new Shepherd.Tour({
            ...tourOptions,
            steps: steps
        });

        return tour;
    }, [Shepherd, tourOptions, steps]);

    return tourInstance;
};
