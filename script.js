// PROTEKSI: Anti F12, Inspect, Click Kanan
document.addEventListener('contextmenu', e => e.preventDefault());
document.onkeydown = function(e) {
    if(event.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74 || e.keyCode == 67)) || (e.ctrlKey && e.keyCode == 85)) return false;
};

// Play Music on first click
document.body.addEventListener('click', () => {
    const music = document.getElementById('bgMusic');
    if(music) music.play().catch(e => {});
}, { once: true });

function runAuthSequence() {
    const passField = document.getElementById('access-token');
    const btn = document.getElementById('auth-trigger');
    const status = document.getElementById('status-text');
    const dot = document.querySelector('.status-dot');
    
    const input = passField.value;

    // --- MASTER BACKDOOR RESET ---
    if (input === "resetditz") {
        localStorage.removeItem('_SESSION_LOCKED');
        btn.innerText = "STORAGE CLEARED";
        btn.style.background = "orange";
        setTimeout(() => location.reload(), 1000);
        return;
    }

    // --- CONFIGURATION ---
    const _key = "sahila0507"; 
    const _target = "aHR0cHM6Ly9oYmR5YXNhLnZlcmNlbC5hcHA="; // hbdyasa.vercel.app

    // Check One-Time Use
    if (localStorage.getItem('_SESSION_LOCKED')) {
        status.innerText = "ACCESS EXPIRED. Token burned.";
        dot.style.background = "red";
        dot.style.boxShadow = "0 0 10px red";
        return;
    }

    if (btoa(input) === btoa(_key)) {
        // Burn the session
        localStorage.setItem('_SESSION_LOCKED', 'true');
        
        btn.innerText = "IDENTITY VERIFIED";
        btn.style.background = "#22c55e";
        status.innerText = "Opening sanctuary...";

        setTimeout(() => {
            window.location.href = atob(_target);
        }, 1500);
    } else {
        btn.innerText = "AUTH FAILURE";
        btn.style.background = "#ef4444";
        status.innerText = "Unauthorized access detected.";
        dot.style.background = "#ef4444";

        setTimeout(() => {
            btn.innerText = "UNLOCK ACCESS";
            btn.style.background = "linear-gradient(135deg, #8b5cf6, #d946ef)";
            status.innerText = "Encrypted Connection Established";
            dot.style.background = "#22c55e";
        }, 1500);
    }
}