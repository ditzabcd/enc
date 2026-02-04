// ====================
// TIME-LOCKED PASSWORD SYSTEM v3.0
// ====================

const MAX_ATTEMPTS = 3;
let attempts = 0;
let isLocked = false;

// ====================
// CONFIGURABLE SETTINGS
// ====================
// GANTI TANGGAL DI BAWAH INI SESUAI KEBUTUHAN:
const UNLOCK_DATE = new Date('2026-07-05'); // Format: YYYY-MM-DD
// Contoh untuk testing:
// - new Date('2024-02-16')  // Besok
// - new Date()              // Sekarang (hapus komentar ini)
// - new Date('2024-02-15')  // Kemarin (sudah bisa dibuka)

// Password yang akan dienkripsi
const REAL_PASSWORD = "sahila";

// ====================
// TIME-BASED ENCRYPTION
// ====================
function getDateKey() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `TIME_${dd}${mm}${yyyy}_LOCK`;
}

function encryptPassword(password) {
    const key = getDateKey();
    let result = '';
    for(let i = 0; i < password.length; i++) {
        const charCode = password.charCodeAt(i);
        const keyCode = key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode ^ keyCode);
    }
    return btoa(result);
}

function verifyPassword(input) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const unlock = new Date(UNLOCK_DATE);
    unlock.setHours(0, 0, 0, 0);
    
    // Cek apakah sudah tanggal unlock
    if (today < unlock) {
        return {
            status: "TOO_EARLY",
            daysLeft: Math.ceil((unlock - today) / (1000 * 60 * 60 * 24))
        };
    }
    
    // Generate encrypted password untuk hari ini
    const encryptedToday = encryptPassword(REAL_PASSWORD);
    
    // Decrypt untuk verifikasi
    try {
        const decrypted = atob(encryptedToday);
        const key = getDateKey();
        let original = '';
        
        for(let i = 0; i < decrypted.length; i++) {
            const charCode = decrypted.charCodeAt(i);
            const keyCode = key.charCodeAt(i % key.length);
            original += String.fromCharCode(charCode ^ keyCode);
        }
        
        if (input === original) {
            return { status: "SUCCESS" };
        } else {
            return { status: "WRONG" };
        }
    } catch {
        return { status: "ERROR" };
    }
}

// ====================
// TERMINAL FUNCTIONS
// ====================
function logMessage(msg, type = '') {
    const log = document.getElementById('terminalLog');
    if(!log) return;
    
    const entry = document.createElement('div');
    if(type) entry.className = type;
    entry.innerHTML = `> [${new Date().toLocaleTimeString('id-ID', {hour12: false})}] ${msg}`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
    
    // Limit log entries
    if(log.children.length > 25) {
        log.removeChild(log.firstChild);
    }
}

function updateSecurityMeter(percent) {
    const meter = document.getElementById('securityLevel');
    if(meter) {
        meter.style.width = percent + '%';
        meter.style.background = percent < 30 ? '#ff0000' : 
                                percent < 70 ? '#ff9900' : '#00ff00';
    }
}

function updateSystemStatus() {
    const today = new Date();
    const unlock = new Date(UNLOCK_DATE);
    const statusEl = document.getElementById('sysStatus');
    
    if(!statusEl) return;
    
    today.setHours(0, 0, 0, 0);
    unlock.setHours(0, 0, 0, 0);
    
    if(today < unlock) {
        const daysLeft = Math.ceil((unlock - today) / (1000 * 60 * 60 * 24));
        statusEl.textContent = `LOCKED (${daysLeft}d)`;
        statusEl.style.color = '#ff5555';
    } else if(today.getTime() === unlock.getTime()) {
        statusEl.textContent = 'UNLOCK_TODAY';
        statusEl.style.color = '#ffff55';
    } else {
        statusEl.textContent = 'ACTIVE';
        statusEl.style.color = '#55ff55';
    }
}

function playDistortion() {
    try {
        const audio = document.getElementById('distortionSound');
        if(audio) {
            audio.currentTime = 0;
            audio.volume = 0.7;
            audio.play().catch(e => {
                console.log("Audio playback blocked");
            });
        }
    } catch(e) {
        // Silent fail
    }
}

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

// ====================
// DATE INFORMATION
// ====================
function showDateInfo() {
    const today = new Date();
    const unlock = new Date(UNLOCK_DATE);
    
    today.setHours(0, 0, 0, 0);
    unlock.setHours(0, 0, 0, 0);
    
    const timeDiff = unlock - today;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    logMessage(`SYSTEM UNLOCK DATE: ${unlock.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}`, "info");
    
    if(daysLeft > 0) {
        logMessage(`ACCESS WILL BE AVAILABLE IN: ${daysLeft} DAY${daysLeft > 1 ? 'S' : ''}`, "warning");
        logMessage(`CURRENT DATE: ${today.toLocaleDateString('id-ID')}`, "info");
    } else if(daysLeft === 0) {
        logMessage("ACCESS AVAILABLE STARTING TODAY!", "success");
    } else {
        logMessage("ACCESS ACTIVE - SYSTEM UNLOCKED", "success");
    }
}

// ====================
// MAIN VERIFICATION
// ====================
function verifyAccess() {
    if(isLocked) {
        logMessage("SYSTEM TEMPORARILY LOCKED - WAIT 10 SECONDS", "error");
        return;
    }
    
    const input = document.getElementById('accessKey');
    const button = document.getElementById('authButton');
    
    if(!input || !input.value.trim()) {
        logMessage("ERROR: NO INPUT DETECTED", "error");
        return;
    }
    
    const userInput = input.value.trim();
    
    // Disable button selama proses
    if(button) button.disabled = true;
    logMessage("CHECKING TIME LOCK STATUS...");
    
    // Animate security meter
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        updateSecurityMeter(progress);
        if(progress >= 100) clearInterval(interval);
    }, 50);
    
    // Proses verifikasi
    setTimeout(() => {
        const result = verifyPassword(userInput);
        
        if(result.status === "TOO_EARLY") {
            // BELUM WAKTUNYA
            logMessage(`❌ ACCESS DENIED - TOO EARLY`, "error");
            logMessage(`⏰ SYSTEM UNLOCKS IN ${result.daysLeft} DAY${result.daysLeft > 1 ? 'S' : ''}`, "warning");
            updateSecurityMeter(30);
            
            attempts++;
            if(attempts >= 2) {
                logMessage("⚠️ MULTIPLE EARLY ACCESS ATTEMPTS DETECTED", "error");
            }
            
        } else if(result.status === "SUCCESS") {
            // PASSWORD BENAR & SUDAH WAKTUNYA
            logMessage("✅ TIME LOCK VERIFIED", "success");
            logMessage("✅ PASSWORD ACCEPTED", "success");
            logMessage("✅ INITIATING REDIRECT SEQUENCE...", "success");
            updateSecurityMeter(100);
            
            // Reset attempts
            attempts = 0;
            
            // Redirect setelah delay
            setTimeout(() => {
                showRedirectScreen();
            }, 1500);
            
        } else if(result.status === "WRONG") {
            // PASSWORD SALAH
            attempts++;
            logMessage(`❌ ACCESS DENIED [ATTEMPT ${attempts}/${MAX_ATTEMPTS}]`, "error");
            logMessage("❌ ENCRYPTION MISMATCH DETECTED", "error");
            updateSecurityMeter(0);
            
            if(attempts >= MAX_ATTEMPTS) {
                isLocked = true;
                logMessage("⚠️ SYSTEM LOCKDOWN ACTIVATED", "error");
                logMessage("⚠️ AUDIO DISTORTION ENGAGED", "error");
                
                playDistortion();
                triggerDistortion();
                
                // Auto unlock setelah 10 detik
                setTimeout(() => {
                    isLocked = false;
                    attempts = 0;
                    logMessage("SYSTEM UNLOCKED - YOU MAY TRY AGAIN", "info");
                }, 10000);
            }
            
        } else {
            // ERROR
            logMessage("SYSTEM ERROR - TRY AGAIN", "error");
            updateSecurityMeter(0);
        }
        
        // Clear input field
        if(input) input.value = "";
        
        // Re-enable button
        if(button) {
            setTimeout(() => {
                button.disabled = false;
                if(input) input.focus();
            }, 500);
        }
        
    }, 1200);
}

// ====================
// REDIRECT SCREEN
// ====================
function showRedirectScreen() {
    // Simpan original body
    const originalBody = document.body.innerHTML;
    
    // Ganti dengan redirect screen
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
            <div style="font-size: 1.8em; margin-bottom: 10px; color: #ff0033; text-shadow: 0 0 10px #ff0033;">
                TIME LOCK VERIFIED
            </div>
            <div style="font-size: 1.2em; margin-bottom: 30px; opacity: 0.9;">
                Encrypted tunnel established
            </div>
            <div style="
                font-size: 2.8em;
                color: #00ff00;
                margin: 30px 0;
                padding: 15px 30px;
                border: 3px solid #00ff00;
                background: rgba(0,255,0,0.1);
                border-radius: 5px;
                text-shadow: 0 0 15px #00ff00;
            ">
                <span id="countdown">3</span>
            </div>
            <div style="font-size: 0.9em; opacity: 0.6; margin-top: 30px; max-width: 500px;">
                Redirecting to: https://hbdyasa.vercel.app/
            </div>
            <div style="font-size: 0.7em; opacity: 0.4; margin-top: 20px;">
                Time lock active until: ${new Date(UNLOCK_DATE).toLocaleDateString('id-ID')}
            </div>
            <style>
                @keyframes blink {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.05); }
                }
                @keyframes pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.7); }
                    50% { box-shadow: 0 0 0 20px rgba(0, 255, 0, 0); }
                }
                #countdown {
                    animation: pulse 1.5s infinite;
                    display: inline-block;
                    width: 60px;
                    height: 60px;
                    line-height: 60px;
                    border-radius: 50%;
                    background: rgba(0, 255, 0, 0.1);
                }
            </style>
        </div>
    `;
    
    // Countdown dan redirect
    let count = 3;
    const countdownEl = document.getElementById('countdown');
    const countdownInterval = setInterval(() => {
        if(countdownEl) {
            countdownEl.textContent = count;
            countdownEl.style.transform = `scale(${1 + (3-count)*0.1})`;
        }
        count--;
        
        if(count < 0) {
            clearInterval(countdownInterval);
            // Redirect ke tujuan akhir
            window.location.replace("https://hbdyasa.vercel.app/");
        }
    }, 1000);
    
    // Backup: jika redirect gagal, kembali setelah 5 detik
    setTimeout(() => {
        if(window.location.href.indexOf('hbdyasa') === -1) {
            document.body.innerHTML = originalBody;
            logMessage("REDIRECT FAILED - MANUAL NAVIGATION REQUIRED", "error");
            initSystem();
        }
    }, 5000);
}

// ====================
// INITIALIZATION
// ====================
function initSystem() {
    logMessage("TIME-LOCKED ACCESS SYSTEM v3.0", "info");
    logMessage("SYSTEM INITIALIZED", "success");
    
    // Tampilkan info tanggal
    showDateInfo();
    
    // Update status
    updateSystemStatus();
    updateSecurityMeter(100);
    
    // Setup enter key
    const inputField = document.getElementById('accessKey');
    if(inputField) {
        inputField.addEventListener('keypress', function(e) {
            if(e.key === 'Enter') {
                verifyAccess();
            }
        });
        
        // Auto focus
        setTimeout(() => {
            inputField.focus();
        }, 1000);
    }
    
    // Update status setiap menit
    setInterval(updateSystemStatus, 60000);
    
    // Log waktu sistem
    logMessage(`SYSTEM TIME: ${new Date().toLocaleString('id-ID')}`);
    logMessage("READY FOR ENCRYPTED KEY INPUT");
}

// ====================
// START SYSTEM
// ====================
document.addEventListener('DOMContentLoaded', function() {
    // Tunggu sebentar untuk pastikan semua element loaded
    setTimeout(initSystem, 500);
});

// ====================
// GLOBAL FUNCTIONS
// ====================
window.verifyAccess = verifyAccess;