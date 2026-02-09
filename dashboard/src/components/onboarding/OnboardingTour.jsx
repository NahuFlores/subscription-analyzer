import React, { useEffect, useCallback, useState, useRef } from 'react';
import { ShepherdJourneyProvider, useShepherd } from 'react-shepherd';
import { TOUR_STEPS, TOUR_OPTIONS } from '../../config/tourSteps';
import { useOnboardingTour } from '../../hooks/useOnboardingTour';
import 'shepherd.js/dist/css/shepherd.css';
import '../../styles/shepherd-theme.css';

/**
 * TourTrigger - Internal component that triggers the tour
 * Uses our clean custom hook pattern
 */
const TourTrigger = ({ onComplete }) => {
    const Shepherd = useShepherd();
    const tourRef = useRef(null);

    useEffect(() => {
        if (!Shepherd) return;

        const tour = new Shepherd.Tour({
            ...TOUR_OPTIONS,
            steps: TOUR_STEPS
        });

        tourRef.current = tour;

        tour.on('complete', onComplete);
        tour.on('cancel', onComplete);

        const timer = setTimeout(() => {
            tour.start();
        }, 800);

        return () => {
            clearTimeout(timer);
            tour.off('complete', onComplete);
            tour.off('cancel', onComplete);
            if (tour.isActive()) {
                tour.cancel();
            }
        };
    }, [Shepherd, onComplete]);

    return null;
};

/**
 * OnboardingTour - Main component
 * Shows tour only for first-time visitors
 */
const OnboardingTour = React.memo(() => {
    const { isFirstVisit, markAsComplete } = useOnboardingTour();
    const [shouldRender, setShouldRender] = useState(false);

    // Check first visit on mount
    useEffect(() => {
        setShouldRender(isFirstVisit());
    }, [isFirstVisit]);

    const handleComplete = useCallback(() => {
        markAsComplete();
        setShouldRender(false);
    }, [markAsComplete]);

    // Early return if not first visit
    if (!shouldRender) {
        return null;
    }

    return (
        <ShepherdJourneyProvider>
            <TourTrigger onComplete={handleComplete} />
        </ShepherdJourneyProvider>
    );
});

OnboardingTour.displayName = 'OnboardingTour';

export default OnboardingTour;
