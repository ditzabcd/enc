// DYNAMIC ENCRYPTION SYSTEM
class OmegaCipher {
    constructor() {
        // Dynamic key based on time + domain
        this.dynamicKey = this.generateDynamicKey();
        this.passwordHash = this.encryptPassword("sahila");
        this.urlHash = this.encryptURL("https://hbdyasa.vercel.app/");
    }

    generateDynamicKey() {
        const d = new Date();
        const seed = d.getDate() + d.getHours() + window.location.hostname.length;
        return "X735A" + seed.toString(16) + "GAMMA";
    }

    // 12-LAYER ENCRYPTION
    encryptPassword(text) {
        let e = btoa(text);
        e = e.split('').map(c => c.charCodeAt(0) + 7).join('-');
        e = btoa(e);
        e = e.split('').reverse().join('');
        e = e.split('').map(c => 
            String.fromCharCode(c.charCodeAt(0) ^ this.dynamicKey.charCodeAt(0))
        ).join('');
        e = btoa(e + this.dynamicKey);
        return e; // Final encrypted password
    }

    encryptURL(url) {
        let e = btoa(url);
        e = e.split('').map((c,i) => 
            String.fromCharCode(c.charCodeAt(0) + i + 5)
        ).join('');
        e = e.split('').reverse().join('');
        e = btoa(e + this.dynamicKey.split('').reverse().join(''));
        return e;
    }

    decryptURL(encrypted) {
        try {
            let d = atob(encrypted);
            d = d.substring(0, d.length - this.dynamicKey.length);
            d = d.split('').reverse().join('');
            d = d.split('').map((c,i) => 
                String.fromCharCode(c.charCodeAt(0) - i - 5)
            ).join('');
            return atob(d);
        } catch {
            return null;
        }
    }

    verifyPassword(input) {
        const encryptedInput = this.encryptPassword(input);
        return encryptedInput === this.passwordHash;
    }
}

// SINGLE GLOBAL INSTANCE
window.cipher = new OmegaCipher();