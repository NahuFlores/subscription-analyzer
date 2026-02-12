import React from "react";
import clsx from "clsx";

export default function AnimatedGenerateButton({
    className,
    labelIdle = "Generate",
    labelActive = "Generating",
    generating = false,
    highlightHueDeg = 210,
    onClick,
    type = "button",
    disabled = false,
    id,
    ariaLabel,
}) {
    return (
        <div className={clsx("relative inline-block", className)} id={id}>
            <button
                type={type}
                aria-label={ariaLabel || (generating ? labelActive : labelIdle)}
                aria-pressed={generating}
                disabled={disabled}
                onClick={onClick}
                className={clsx(
                    "ui-anim-btn group", // Added group for hover effects
                    "relative flex items-center justify-center cursor-pointer select-none",
                    "rounded-[24px] px-3 py-1.5 sm:px-3 md:px-3 xl:px-2 xl:py-1",
                    // Premium Background: Subtle Gradient + Glass
                    "bg-linear-to-br from-white/5 to-white/10 hover:from-primary/20 hover:to-accent-purple/20",
                    "backdrop-blur-md text-(--text-primary)",
                    "border border-white/10 hover:border-primary/30",
                    // Magic Glow Effect
                    "shadow-[0_0_15px_-3px_rgba(99,102,241,0.1)] hover:shadow-[0_0_20px_0px_rgba(99,102,241,0.3)]",
                    // Original Inner Shadows (preserved but softened)
                    "shadow-[inset_0px_1px_1px_rgba(255,255,255,0.15),inset_0px_2px_2px_rgba(255,255,255,0.05)]",
                    "transition-all duration-300 ease-out", // Smoother transition
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                style={{
                    "--highlight-hue": `${highlightHueDeg}deg`,
                }}
            >
                <svg
                    className={clsx(
                        "ui-anim-btn-svg mr-2 h-5 w-5 shrink-0",
                        "fill-(--ui-anim-svg-fill)",
                        "transition-[fill,filter,opacity] duration-400",
                        // Icon Animation: Spin/Pulse on Hover/Active
                        "group-hover:animate-pulse group-hover:scale-110",
                        generating && "animate-spin"
                    )}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                    ></path>
                </svg>
                <div className="ui-anim-txt-wrapper grid place-items-center">
                    <div
                        className={clsx(
                            "ui-anim-txt-1 col-start-1 row-start-1",
                            generating ? "opacity-0 invisible" : "animate-[ui-appear_1s_ease-in-out_forwards]"
                        )}
                    >
                        {Array.from(labelIdle).map((ch, i) => (
                            <span key={i} className="ui-anim-letter inline-block">
                                {ch === " " ? "\u00A0" : ch}
                            </span>
                        ))}
                    </div>
                    <div
                        className={clsx(
                            "ui-anim-txt-2 col-start-1 row-start-1",
                            generating ? "opacity-100" : "opacity-0 invisible"
                        )}
                    >
                        {Array.from(labelActive).map((ch, i) => (
                            <span key={i} className="ui-anim-letter inline-block">
                                {ch === " " ? "\u00A0" : ch}
                            </span>
                        ))}
                    </div>
                </div>
            </button>
            <style>{`
        .ui-anim-btn {
          --padding: 4px;
          --radius: 24px;
          --transition: 0.4s;
          --highlight: hsl(var(--highlight-hue), 80%, 65%);
          --highlight-50: hsla(var(--highlight-hue), 80%, 65%, 0.5);
          --highlight-30: hsla(var(--highlight-hue), 80%, 65%, 0.3);
          --highlight-20: hsla(var(--highlight-hue), 80%, 65%, 0.2);
          --highlight-80: hsla(var(--highlight-hue), 80%, 65%, 0.8);
          --ui-anim-svg-fill: currentColor;
          background-color: rgba(0,0,0,0.2);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: white;
          border-color: rgba(255,255,255,0.1);
        }

        .ui-anim-btn::before {
          content: "";
          position: absolute;
          top: calc(0px - var(--padding));
          left: calc(0px - var(--padding));
          width: calc(100% + var(--padding) * 2);
          height: calc(100% + var(--padding) * 2);
          border-radius: calc(var(--radius) + var(--padding));
          pointer-events: none;
          background-image: linear-gradient(0deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05));
          z-index: -1;
          transition: box-shadow var(--transition), filter var(--transition);
          box-shadow: 0 -8px 8px -6px rgba(0,0,0,0) inset, 0 -16px 16px -8px rgba(0,0,0,0) inset, 1px 1px 1px rgba(255,255,255,0.1), 2px 2px 2px rgba(255,255,255,0.05), -1px -1px 1px rgba(0,0,0,0.1), -2px -2px 2px rgba(0,0,0,0.05);
        }

        .ui-anim-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          background-image: linear-gradient(0deg, #fff, var(--highlight), var(--highlight-50), 8%, transparent);
          background-position: 0 0;
          opacity: 0;
          transition: opacity var(--transition), filter var(--transition);
        }
        
        .ui-anim-btn:hover { 
            background-color: rgba(99, 102, 241, 0.15); /* Primary tint on hover */
            border-color: hsla(var(--highlight-hue), 100%, 80%, 0.4); 
            box-shadow: 0 0 20px -5px var(--highlight-50);
        }

        /* Responsive text sizing */
        .ui-anim-txt-wrapper {
            font-size: 0.875rem; /* text-sm default */
        }
        @media (max-width: 640px) {
            .ui-anim-txt-wrapper {
                font-size: 0.75rem; /* text-xs on mobile */
            }
        }
        
        ${Array.from({ length: 20 })
                    .map((_, i) => `.ui-anim-txt-1 .ui-anim-letter:nth-child(${i + 1}), .ui-anim-txt-2 .ui-anim-letter:nth-child(${i + 1}) { animation-delay: ${i * 0.05}s; }`)
                    .join("\n")}
      `}</style>
        </div>
    );
}
