import { GrainGradient } from '@paper-design/shaders-react';

export default function GrainBackground({
    colors = ["#611ca6", "#000000"],
    width = 512,
    height = 1000,
    scale = 0.72
}) {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden rounded-[32px] pointer-events-none opacity-60 mix-blend-overlay">
            <GrainGradient
                width={width}
                height={height}
                colors={colors}
                colorBack="#00000000"
                softness={1}
                intensity={0.26}
                noise={0}
                shape="wave"
                speed={1}
                scale={scale}
            />
        </div>
    );
}
