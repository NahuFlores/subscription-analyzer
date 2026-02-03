import { useEffect, useRef } from 'react';
import anime from 'animejs';

const BAR_COUNT = 12; // Reduced count for a button

export default function WaveBackground() {
    const barsRef = useRef([]);

    useEffect(() => {
        const intervals = [];

        barsRef.current.forEach((bar, index) => {
            if (!bar) return;

            const animateBar = () => {
                const time = Date.now() / 400;
                // Wave calculation from portfolio
                const wave = Math.sin(time + index / 2) * 25;
                const noise = Math.random() * 15;
                const newHeight = Math.max(10, 30 + wave + noise);

                anime({
                    targets: bar,
                    height: `${newHeight}%`,
                    duration: 500,
                    easing: 'easeOutQuad',
                });
            };

            animateBar();
            // Interval for continuous fluid motion
            const interval = setInterval(animateBar, 60);
            intervals.push(interval);
        });

        return () => {
            intervals.forEach(clearInterval);
            // Cleanup animejs instances if needed, though they are fire-and-forget here largely
        };
    }, []);

    return (
        <div
            className="absolute inset-x-0 bottom-0 h-full flex items-end justify-center gap-[2px] pointer-events-none overflow-hidden rounded-2xl z-0"
            style={{
                filter: 'blur(8px)', // Slightly reduced blur for smaller scale
                opacity: 0.6,
                transform: 'translateZ(0)', // Force GPU
            }}
        >
            {Array.from({ length: BAR_COUNT }).map((_, i) => (
                <div
                    key={i}
                    ref={(el) => { if (el) barsRef.current[i] = el; }}
                    className="flex-1 max-w-[4px] rounded-t-sm bg-linear-to-t from-indigo-500 via-purple-500 to-cyan-400"
                    style={{
                        height: '20%',
                    }}
                />
            ))}
        </div>
    );
}
