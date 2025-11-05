// Simplified script: remove matrix background, remove language/timecode/battery logic, keep vCard generation and lightweight interactions

// Generate vCard file dynamically with new details
function buildVCardText() {
    return `BEGIN:VCARD
 VERSION:3.0
 FN:Gaby Mrad
 ORG:Arabnights
 TITLE:Host / Radio Producer
 TEL:+31644219300
 EMAIL:gaby.mrad@outlook.com
 URL:https://www.thearabnights.com/
 NOTE:Arabnights - Radio, shows & media
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
                // On many mobile devices, navigating to a .vcf will prompt adding to contacts.
                // We programmatically open the blob link to trigger the native handler, and also show a preview.
                e.preventDefault();

                // open the vcard in a new tab/window to trigger platform behavior
                try {
                    const win = window.open(vcardUrl, '_blank');
                    if (!win) {
                        // fallback: set location
                        window.location.href = vcardUrl;
                    }
                } catch (err) {
                    window.location.href = vcardUrl;
                }

                // show preview so the user sees details and can re-download if needed
                openPreview(vcardText);
            } else {
                // Desktop: allow normal download but also show preview optionally (no auto-save)
                // Let the anchor behave as a direct download; also set preview content but don't auto-open.
                // show preview on ctrl/cmd click or after a short delay
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    openPreview(vcardText);
                } else {
                    // allow default anchor download behavior
                    // ensure href is up-to-date
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