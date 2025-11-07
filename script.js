// Simplified script: remove matrix background, remove language/timecode/battery logic, keep vCard generation and lightweight interactions

// Build a more complete vCard (VERSION:3.0) with structured fields and social links.
// Mobile platforms (iOS/Android) will typically open the contact import when a .vcf is navigated to or opened.
// Desktop will receive a downloadable .vcf file.
function buildVCardText() {
    // Use structured fields: N; FN; ORG; TITLE; TEL; EMAIL; URL; NOTE; X-SOCIALPROFILE style lines
    const fullName = "Gaby Mrad";
    const org = "Arabnights";
    const title = "DJ; Digital Distribution; Microsoft BI Consultant";
    const phone = "+31644219300";
    const email = "gaby.mrad@outlook.com";
    const website = "https://www.thearabnights.com/";
    const instagram = "https://www.instagram.com/gaby.mrad";
    const xProfile = "https://twitter.com/gabymrad";
    const linkedin = "https://www.linkedin.com/in/gabymrad";
    const anghami = "https://open.anghami.com/uPY3w0T1XXb";
    const youtube = "https://youtube.com/@thearabnights";
    const businessChannel = "https://www.thearabnights.com/channel";
    const tiktok = "https://www.tiktok.com/@thearabnights";
    const radio1 = "https://onlineradiobox.com/nl/arabnights/";
    const radio2 = "http://tun.in/se6UY";

    // Build vCard lines. Use multiple FN, N, TITLE, ORG, TEL, EMAIL, URL and NOTE fields.
    // For broad compatibility, include social links in NOTE and as X-SOCIALPROFILE where reasonable.
    const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        // N: Family; Given ; Additional ; Prefix ; Suffix — we don't have family/given split, so put full name in FN below
        `FN:${fullName}`,
        `N:${fullName};;;;`,
        `ORG:${org}`,
        `TITLE:${title}`,
        `TEL;TYPE=CELL,VOICE:${phone}`,
        `EMAIL;TYPE=INTERNET:${email}`,
        `URL:${website}`,
        // Add social links as both NOTE and X-SOCIALPROFILE for compatibility
        `NOTE:Instagram: ${instagram} \\nX: ${xProfile} \\nLinkedIn: ${linkedin} \\nAnghami: ${anghami} \\nYouTube: ${youtube} \\nBusiness Channel: ${businessChannel} \\nTikTok: ${tiktok} \\nRadio1: ${radio1} \\nRadio2: ${radio2}`,
        `X-SOCIALPROFILE;type=instagram:${instagram}`,
        `X-SOCIALPROFILE;type=twitter:${xProfile}`,
        `X-SOCIALPROFILE;type=linkedin:${linkedin}`,
        `X-SOCIALPROFILE;type=anghami:${anghami}`,
        `X-SOCIALPROFILE;type=youtube:${youtube}`,
        `X-SOCIALPROFILE;type=tiktok:${tiktok}`,
        // Provide source/notes about business
        `X-ABLABEL:Business`,
        `X-ABADR:;;`,
        `X-ABUID:arabnights`,
        "END:VCARD"
    ];

    return lines.join("\r\n");
}

let vcardUrl = null;

// Create or refresh vCard blob URL and update links that reference it.
function generateVCard() {
    // revoke previous
    if (vcardUrl) {
        try { URL.revokeObjectURL(vcardUrl); } catch (e) {}
        vcardUrl = null;
    }

    const vcard = buildVCardText();
    // Use the standard MIME type for vCard. Some platforms prefer text/x-vcard or text/vcard.
    const blob = new Blob([vcard], { type: 'text/vcard' });
    vcardUrl = URL.createObjectURL(blob);

    const vcardBtn = document.querySelector('#vcardBtn');
    const previewDownload = document.querySelector('#previewDownload');

    if (vcardBtn) vcardBtn.href = vcardUrl;
    if (previewDownload) previewDownload.href = vcardUrl;
    return vcard;
}

function isMobileDevice() {
    // Basic mobile detection: touch-capable device and narrow viewport
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
                // On mobile: open the vCard URL directly to trigger native "Add to Contact" flow.
                // Use navigation instead of download to encourage the OS to import the vCard.
                e.preventDefault();

                // For maximum compatibility:
                // 1) Try to open via window.location (same tab) which often triggers import.
                // 2) Fallback: open in a new tab/window.
                try {
                    // Some browsers block window.open from click handlers if popup blocked; prefer location change first.
                    window.location.href = vcardUrl;
                } catch (err) {
                    try {
                        const win = window.open(vcardUrl, '_blank');
                        if (!win) window.location.href = vcardUrl;
                    } catch (err2) {
                        window.location.href = vcardUrl;
                    }
                }

                // Show a preview overlay so user sees what's being saved (non-blocking)
                openPreview(vcardText);
            } else {
                // Desktop: maintain download behavior.
                // Ensure the link has download attribute (so browsers download instead of navigate)
                // Allow modifier keys to open preview instead if Ctrl/Cmd pressed.
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    openPreview(vcardText);
                    return;
                }
                // Set href to blob url and let default click proceed to download (button markup already has download attribute)
                this.href = vcardUrl;
                // ensure the download attribute exists (in case it's missing)
                if (!this.hasAttribute('download')) {
                    this.setAttribute('download', 'Arabnights-Contact.vcf');
                }
                // No preventDefault so browser performs the download.
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
