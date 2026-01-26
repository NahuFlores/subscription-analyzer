const lenis = new Lenis({
    duration: 1.5, // Optimal 'smooth' feel usually between 1.2 and 1.6
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

// Animation Frame Loop
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Production log
console.log('Lenis Smooth Scroll initialized');
