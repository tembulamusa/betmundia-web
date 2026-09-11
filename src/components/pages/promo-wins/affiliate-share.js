/**
 * Shared affiliate share payload + platform openers.
 * Used by AffiliateShareModal and Market yourself.
 *
 * Image note: there is no dedicated affiliate OG/share banner. Facebook/X
 * link previews come from the signup landing page meta. WhatsApp/Instagram
 * web cannot attach images — we ship a strong text + link CTA instead.
 */

export const AFFILIATE_SHARE_IMAGE_URL = null;

export function getAffiliateShareUrl(code) {
    if (!code) return "https://betmundial.com/signup";
    return `https://betmundial.com/signup/${code}`;
}

/**
 * @returns {{
 *   promoCode: string,
 *   shareUrl: string,
 *   shareText: string,
 *   shareTextShort: string,
 *   shareImageUrl: string | null,
 * }}
 */
export function buildAffiliateSharePayload(code) {
    const promoCode = String(code || "").trim();
    const shareUrl = getAffiliateShareUrl(promoCode);
    const shareTextShort = promoCode
        ? `Join Betmundial with my affiliate code ${promoCode} — sign up and start winning!`
        : "Join Betmundial — sign up and start winning!";
    // Full CTA for WhatsApp / clipboard (includes link in the body).
    const shareText = `${shareTextShort} ${shareUrl}`;

    return {
        promoCode,
        shareUrl,
        shareText,
        shareTextShort,
        shareImageUrl: AFFILIATE_SHARE_IMAGE_URL,
    };
}

/**
 * Build the platform intent URL (null for Instagram — handled as copy + open).
 */
export function getPlatformShareUrl(platform, payload) {
    const { shareUrl, shareText, shareTextShort } = payload;
    const textEncoded = encodeURIComponent(shareText);
    const shortEncoded = encodeURIComponent(shareTextShort);
    const urlEncoded = encodeURIComponent(shareUrl);

    switch (platform) {
        case "whatsapp":
            // Web WhatsApp cannot attach images; text includes CTA + link.
            return `https://wa.me/?text=${textEncoded}`;
        case "facebook":
            // Preview depends on OG tags on the shared signup URL.
            return `https://www.facebook.com/sharer/sharer.php?u=${urlEncoded}&quote=${shortEncoded}`;
        case "x":
            return `https://twitter.com/intent/tweet?text=${shortEncoded}&url=${urlEncoded}`;
        case "instagram":
            return "https://www.instagram.com/";
        default:
            return null;
    }
}

/**
 * Open / copy for a social platform.
 * @returns {Promise<{ ok: boolean, hint: string }>}
 */
export async function openAffiliateSocialShare(platform, code) {
    const payload = buildAffiliateSharePayload(code);
    if (!payload.promoCode) {
        return { ok: false, hint: "No affiliate code to share." };
    }

    if (platform === "copy-code") {
        try {
            await navigator.clipboard.writeText(payload.promoCode);
            return { ok: true, hint: "Code copied." };
        } catch (_) {
            return { ok: false, hint: "Unable to copy code." };
        }
    }

    if (platform === "copy") {
        try {
            await navigator.clipboard.writeText(payload.shareUrl);
            return { ok: true, hint: "Copied!" };
        } catch (_) {
            return { ok: false, hint: "Unable to copy link." };
        }
    }

    if (platform === "instagram") {
        // Web cannot prefill Instagram posts; copy CTA+link then open IG.
        try {
            await navigator.clipboard.writeText(payload.shareText);
            window.open(
                getPlatformShareUrl("instagram", payload),
                "_blank",
                "noopener,noreferrer"
            );
            return {
                ok: true,
                hint: "Invite copied — paste it in an Instagram DM, Story, or post.",
            };
        } catch (_) {
            return {
                ok: false,
                hint: "Unable to copy. Please share your code manually.",
            };
        }
    }

    const shareUrl = getPlatformShareUrl(platform, payload);
    if (shareUrl) {
        window.open(shareUrl, "_blank", "noopener,noreferrer");
        return { ok: true, hint: "" };
    }

    return { ok: false, hint: "Unable to open share." };
}
