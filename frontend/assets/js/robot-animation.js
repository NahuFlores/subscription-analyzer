/**
 * Robot Sprite Animation Controller
 * Static most of the time, plays animation every X seconds
 */

class RobotAnimation {
    constructor() {
        this.robot = document.getElementById('robot-sprite');
        if (!this.robot) return;

        this.totalFrames = 125;
        this.currentFrame = 0;
        this.frameRate = 25; // ms per frame
        this.pauseDuration = 20000; // Play every 20 seconds for a more "alive" feel
        this.isPlaying = false;

        // Preload all frames
        this.frames = [];
        this.preloadFrames();
    }

    preloadFrames() {
        let loaded = 0;
        let errors = 0;

        for (let i = 0; i < this.totalFrames; i++) {
            const img = new Image();
            const frameNum = String(i).padStart(3, '0');
            img.src = `assets/images/robot-split/frame_${frameNum}_delay-0.02s.gif`;

            img.onload = () => {
                loaded++;
                if (loaded + errors === this.totalFrames) {
                    setTimeout(() => this.playAnimation(), 5000);
                }
            };

            img.onerror = () => {
                errors++;
                if (loaded + errors === this.totalFrames && loaded > 0) {
                    setTimeout(() => this.playAnimation(), 5000);
                }
            };

            this.frames[i] = img;
        }
    }

    startLoop() {
        // Handled by preload complete callback
    }

    playAnimation() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.currentFrame = 0;


        const animate = () => {
            if (this.currentFrame < this.totalFrames && this.frames[this.currentFrame]) {
                this.robot.src = this.frames[this.currentFrame].src;
                this.currentFrame++;
                setTimeout(animate, this.frameRate);
            } else {
                // Animation complete - return to base frame
                this.currentFrame = 0;
                if (this.frames[0]) {
                    this.robot.src = this.frames[0].src;
                }
                this.isPlaying = false;

                // Add some random variance to the next play time (15s to 25s)
                const nextWait = this.pauseDuration + (Math.random() - 0.5) * 10000;
                setTimeout(() => this.playAnimation(), nextWait);
            }
        };

        animate();
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new RobotAnimation();
});
