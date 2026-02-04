// ====================
// AUTHENTICATION SYSTEM v2.0
// ====================

const MAX_ATTEMPTS = 3;
let attempts = 0;
let isLocked = false;

// Password encryption (simple but effective)
const SECRET_KEY = "OMEGA_735A_GAMMA_XVOID";
const ENCRYPTED_PASS = btoa(
    Array.from("sahila").map((c, i) => 
        String.fromCharCode(c.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length))
    ).join('')
);

// Terminal logging
function logMessage(msg, type = '') {
    const log = document.getElementById('terminalLog');
    if(!log) return;
    
    const entry = document.createElement('div');
    entry.className = type;
    entry.innerHTML = `> [${new Date().toLocaleTimeString('id-ID', {hour12: false})}] ${msg}`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
    
    // Limit log entries
    if(log.children.length > 20) {
        log.removeChild(log.firstChild);
    }
}

// Security meter animation
function updateSecurityMeter(percent) {
    const meter = document.getElementById('securityLevel');
    if(meter) {
        meter.style.width = percent + '%';
        meter.style.background = percent < 30 ? '#ff0000' : 
                                percent < 70 ? '#ff9900' : '#00ff00';
    }
}

// Play distortion sound
function playDistortion() {
    const audio = document.getElementById('distortionSound');
    if(audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {
            // Fallback: create audio dynamically
            const fallbackAudio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-glitch-sound-3991.mp3');
            fallbackAudio.volume = 0.5;
            fallbackAudio.play();
        });
    }
}

// Visual distortion effect
function triggerDistortion() {
    const monitor = document.querySelector('.crt-monitor');
    if(monitor) {
        monitor.style.animation = 'shake 0.5s';
        monitor.style.filter = 'invert(1) hue-rotate(90deg)';
        
        setTimeout(() => {
            monitor.style.animation = '';
            monitor.style.filter = '';
        }, 1000);
    }
}

// Password verification
function verifyPassword(input) {
    try {
        const decrypted = atob(ENCRYPTED_PASS);
        const test = Array.from(decrypted).map((c, i) => 
            String.fromCharCode(c.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length))
        ).join('');
        
        return input === test;
    } catch {
        return false;
    }
}

// Main verification function
function verifyAccess() {
    if(isLocked) {
        logMessage("SYSTEM TEMPORARILY LOCKED", "error");
        return;
    }
    
    const input = document.getElementById('accessKey')?.value.trim();
    const button = document.getElementById('authButton');
    
    if(!input) {
        logMessage("ERROR: NO INPUT DETECTED", "error");
        return;
    }
    
    if(button) button.disabled = true;
    logMessage("VERIFYING ENCRYPTED KEY...");
    
    // Animate security meter
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        updateSecurityMeter(progress);
        if(progress >= 100) clearInterval(interval);
    }, 50);
    
    setTimeout(() => {
        if(verifyPassword(input)) {
            // SUCCESS
            logMessage("✅ ACCESS GRANTED", "success");
            logMessage("✅ DECRYPTION SUCCESSFUL", "success");
            logMessage("✅ INITIATING REDIRECT...", "success");
            updateSecurityMeter(100);
            
            // Success redirect
            setTimeout(() => {
                showRedirectScreen();
            }, 1500);
            
        } else {
            // FAILED
            attempts++;
            logMessage(`❌ ACCESS DENIED [${attempts}/${MAX_ATTEMPTS}]`, "error");
            updateSecurityMeter(0);
            
            if(attempts >= MAX_ATTEMPTS) {
                isLocked = true;
                logMessage("⚠️ SYSTEM LOCKDOWN ACTIVATED", "error");
                playDistortion();
                triggerDistortion();
                
                // Auto unlock after 10 seconds
                setTimeout(() => {
                    isLocked = false;
                    attempts = 0;
                    logMessage("SYSTEM UNLOCKED. TRY AGAIN.");
                }, 10000);
            }
            
            if(document.getElementById('accessKey')) {
                document.getElementById('accessKey').value = "";
            }
        }
        
        if(button) button.disabled = false;
    }, 1200);
}

// Redirect screen
function showRedirectScreen() {
    document.body.innerHTML = `
        <div style="
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: #000;
            color: #0f0;
            font-family: 'Courier New', monospace;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            padding: 20px;
            text-align: center;
        ">
            <div style="font-size: 4em; animation: blink 1s infinite; margin-bottom: 20px;">⛧</div>
            <div style="font-size: 1.5em; margin-bottom: 10px; color: #ff0033;">
                OMEGA ACCESS GRANTED
            </div>
            <div style="font-size: 1em; margin-bottom: 30px; opacity: 0.8;">
                Encrypted tunnel established
            </div>
            <div style="
                font-size: 2.5em;
                color: #00ff00;
                margin: 20px 0;
                padding: 10px 20px;
                border: 2px solid #00ff00;
                background: rgba(0,255,0,0.1);
            ">
                <span id="countdown">3</span>
            </div>
            <div style="font-size: 0.8em; opacity: 0.5; margin-top: 30px;">
                Redirecting to secure destination...
            </div>
            <style>
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
            </style>
        </div>
    `;
    
    // Countdown then redirect
    let count = 3;
    const countdown = setInterval(() => {
        const countEl = document.getElementById('countdown');
        if(countEl) countEl.textContent = count;
        count--;
        
        if(count < 0) {
            clearInterval(countdown);
            // FINAL REDIRECT
            window.location.replace("https://hbdyasa.vercel.app/");
        }
    }, 1000);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    logMessage("SYSTEM READY. ENTER ENCRYPTED KEY.");
    updateSecurityMeter(100);
    
    // Enter key support
    const inputField = document.getElementById('accessKey');
    if(inputField) {
        inputField.addEventListener('keypress', function(e) {
            if(e.key === 'Enter') {
                verifyAccess();
            }
        });
    }
    
    // Focus on input
    setTimeout(() => {
        if(inputField) inputField.focus();
    }, 500);
});