/**
 * Detect login / API messages that indicate a frozen account.
 * Matches case-insensitive "freeze", "frozen", and "account freeze".
 */
export const isAccountFrozenMessage = (message) => {
    if (message == null) {
        return false;
    }

    let text = '';
    if (typeof message === 'string') {
        text = message;
    } else if (typeof message === 'object') {
        text = [
            message.message,
            message.description,
            message.result,
            message.error?.description,
            message.error?.message,
            typeof message.error === 'string' ? message.error : null,
        ]
            .filter(Boolean)
            .join(' ');
        if (!text) {
            try {
                text = JSON.stringify(message);
            } catch {
                text = String(message);
            }
        }
    } else {
        text = String(message);
    }

    return /freez/i.test(text);
};

export const REACTIVATE_ACCOUNT_PATH = '/reactivate-account';
export const SUPPORT_EMAIL = 'support@betmundial.com';
export const SMS_SHORTCODE = '29280';
export const REACTIVATION_SMS_BODY =
    'please reactivate me I wish to continue with betting';
