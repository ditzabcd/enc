class DistortionAudio {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
    }
    
    createDistortionSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if(!this.audioContext) this.audioContext = new AudioContext();
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const distortion = this.audioContext.createWaveShaper();
            
            // Configure distortion
            function makeDistortionCurve(amount) {
                const k = typeof amount === 'number' ? amount : 50;
                const n_samples = 44100;
                const curve = new Float32Array(n_samples);
                const deg = Math.PI / 180;
                
                for (let i = 0; i < n_samples; ++i) {
                    const x = i * 2 / n_samples - 1;
                    curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
                }
                return curve;
            }
            
            distortion.curve = makeDistortionCurve(400);
            distortion.oversample = '4x';
            
            oscillator.connect(distortion);
            distortion.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 1);
            
            gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 2);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 2);
            
            this.isPlaying = true;
            setTimeout(() => { this.isPlaying = false; }, 2000);
            
        } catch(e) {
            // Fallback to HTML5 audio
            const audio = document.getElementById('distortionSound');
            if(audio) {
                audio.currentTime = 0;
                audio.play().catch(() => {});
            }
        }
    }
    
    play() {
        if(!this.isPlaying) {
            this.createDistortionSound();
        }
    }
}

window.audioSystem = new DistortionAudio();