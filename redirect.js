(function() {
    // Self-executing anonymous function untuk stealth
    
    // Check token
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if(token) {
        try {
            // Decode token
            const decodedToken = atob(decodeURIComponent(token));
            const finalURL = window.cipher.decryptURL(decodedToken);
            
            if(finalURL && finalURL.startsWith('https://')) {
                // Anti-screenshot protection
                document.body.style.background = '#000';
                document.body.innerHTML = `
                    <div style="
                        position: fixed;
                        top: 0; left: 0;
                        width: 100%; height: 100%;
                        background: #000;
                        color: #0f0;
                        font-family: monospace;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        z-index: 9999;
                    ">
                        <div style="font-size: 3em; animation: blink 1s infinite;">⛧</div>
                        <div style="font-size: 1.5em; margin: 20px;">ENCRYPTED_REDIRECT_ACTIVE</div>
                        <div id="countdown" style="font-size: 2em;">5</div>
                        <div style="font-size: 0.8em; opacity: 0.7; margin-top: 20px;">
                            DO_NOT_SHARE_SCREEN
                        </div>
                    </div>
                `;
                
                // Add CSS
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
                    body { overflow: hidden; }
                `;
                document.head.appendChild(style);
                
                // Countdown then redirect
                let count = 5;
                const countdownEl = document.getElementById('countdown');
                const timer = setInterval(() => {
                    countdownEl.textContent = count;
                    count--;
                    if(count < 0) {
                        clearInterval(timer);
                        // Clean redirect tanpa referrer
                        window.location.replace(finalURL);
                    }
                }, 1000);
                
            } else {
                document.body.textContent = "ACCESS_DENIED";
            }
        } catch(e) {
            document.body.textContent = "CORRUPTED_TOKEN";
        }
    } else {
        // No token, go back
        setTimeout(() => {
            window.history.back();
        }, 2000);
        document.body.innerHTML = "<h1>INVALID_ACCESS</h1>";
    }
})();