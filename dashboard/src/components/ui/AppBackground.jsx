import { StaticRadialGradient } from '@paper-design/shaders-react';
import { useState, useEffect } from 'react';

export default function AppBackground() {
    // Track viewport dimensions for proper centering
    const [dimensions, setDimensions] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1920,
        height: typeof window !== 'undefined' ? window.innerHeight : 1080
    });

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            <StaticRadialGradient
                width={dimensions.width}
                height={dimensions.height}
                colors={["#322588", "#1a1a2e", "#0a0a0f"]}
                colorBack="#0a0a0f"
                radius={0.6}
                focalDistance={0.5}
                focalAngle={45}
                falloff={0.4}
                mixing={0.7}
                distortion={0.1}
                distortionShift={0}
                distortionFreq={8}
                grainMixer={0.05}
                grainOverlay={0.03}
                className="w-full h-full opacity-50"
            />
        </div>
    );
}