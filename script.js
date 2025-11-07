// Simplified script: remove matrix background, remove language/timecode/battery logic, keep vCard generation and lightweight interactions

// Generate vCard file dynamically with new details
function buildVCardText() {
    // include structured vCard with full URLs and notes for social links so mobile contact importers get all info
    return `BEGIN:VCARD
VERSION:3.0
FN:Gaby Mrad
ORG:Arabnights
TITLE:DJ; Digital Distribution; Microsoft BI Consultant
TEL;TYPE=WORK,VOICE:+31644219300
EMAIL;TYPE=INTERNET:gaby.mrad@outlook.com
URL:https://www.thearabnights.com/
NOTE:Instagram: https://www.instagram.com/gaby.mrad
NOTE:X: https://twitter.com/gabymrad
NOTE:LinkedIn: https://www.linkedin.com/in/gabymrad
NOTE:Anghami: https://open.anghami.com/uPY3w0T1XXb
NOTE:YouTube: https://youtube.com/@thearabnights
NOTE:Business Channel: https://www.thearabnights.com/channel
NOTE:TikTok: https://www.tiktok.com/@thearabnight
NOTE:Radio (OnlineRadioBox): https://onlineradiobox.com/nl/arabnights/
NOTE:Radio (tun.in): http://tun.in/se6UY
END:VCARD`;
}

let vcardUrl = null;

function generateVCard() {
    // revoke previous
    if (vcardUrl) {
        try { URL.revokeObjectURL(vcardUrl); } catch (e) {}
        vcardUrl = null;
    }

    const vcard = buildVCardText();
    const blob = new Blob([vcard], { type: 'text/vcard' });
    vcardUrl = URL.createObjectURL(blob);

    const vcardBtn = document.querySelector('#vcardBtn');
    const previewDownload = document.querySelector('#previewDownload');

    if (vcardBtn) vcardBtn.href = vcardUrl;
    if (previewDownload) previewDownload.href = vcardUrl;
    return vcard;
}

function isMobileDevice() {
    // Basic mobile detection: small screen or touch-capable
    return ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.matchMedia('(max-width: 900px)').matches;
}

document.addEventListener('DOMContentLoaded', () => {
    // initialize vcard
    const initialText = generateVCard();

    // smooth scroll for internal anchors (keep)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    const vcardBtn = document.querySelector('#vcardBtn');
    const contactPreview = document.getElementById('contactPreview');
    const contactPreviewContent = document.getElementById('contactPreviewContent');
    const closePreview = document.getElementById('closePreview');
    const previewClose = document.getElementById('previewClose');
    const previewDownload = document.getElementById('previewDownload');

    function openPreview(vcardText) {
        if (!contactPreview || !contactPreviewContent) return;
        contactPreviewContent.textContent = vcardText;
        contactPreview.setAttribute('aria-hidden', 'false');
    }

    function closePreviewFn() {
        if (!contactPreview) return;
        contactPreview.setAttribute('aria-hidden', 'true');
    }

    // wire close buttons
    if (closePreview) closePreview.addEventListener('click', closePreviewFn);
    if (previewClose) previewClose.addEventListener('click', closePreviewFn);

    // clicking outside modal closes it
    if (contactPreview) {
        contactPreview.addEventListener('click', (e) => {
            if (e.target === contactPreview) closePreviewFn();
        });
    }

    if (vcardBtn) {
        vcardBtn.addEventListener('click', async function (e) {
            // Ensure vcard exists and links updated
            const vcardText = generateVCard();

            if (isMobileDevice()) {
                e.preventDefault();

                // open the vcard blob directly to trigger native "Add to contacts" on mobile
                try {
                    const win = window.open(vcardUrl, '_blank');
                    if (!win) window.location.href = vcardUrl;
                } catch (err) {
                    window.location.href = vcardUrl;
                }

                // also show preview for clarity
                openPreview(vcardText);
            } else {
                // Desktop: keep download behavior and show preview when ctrl/cmd pressed
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    openPreview(vcardText);
                } else {
                    this.href = vcardUrl;
                }
            }
        });
    }

    // preview download uses href set earlier; also ensure it triggers download on click
    if (previewDownload) {
        previewDownload.addEventListener('click', () => {
            // link already points to vcardUrl and has download attribute
            // close preview after a brief timeout to allow native save to start
            setTimeout(closePreviewFn, 600);
        });
    }
});

// revoke object URL on unload
window.addEventListener('beforeunload', () => {
    const v = document.querySelector('#vcardBtn');
    if (v && v.href) {
        try { URL.revokeObjectURL(v.href); } catch (e) {}
    }
    if (vcardUrl) {
        try { URL.revokeObjectURL(vcardUrl); } catch(e) {}
    }
});
