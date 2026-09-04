import { getFromLocalStorage, setLocalStorage } from './local-storage';

export const IP_ADDRESS_KEY = 'ip_address';
const IP_REFRESH_MS = 20 * 60 * 1000;
const IPIFY_URL = 'https://api64.ipify.org?format=json';

export const getStoredIpAddress = () => {
    const ip = getFromLocalStorage(IP_ADDRESS_KEY);
    return ip ? String(ip) : '';
};

export const fetchAndStoreIpAddress = async () => {
    try {
        const response = await fetch(IPIFY_URL);
        const data = await response.json();
        const ip = String(data?.ip || '');

        if (ip) {
            setLocalStorage(IP_ADDRESS_KEY, ip, IP_REFRESH_MS);
        }

        return ip;
    } catch {
        return getStoredIpAddress();
    }
};

export const startIpAddressRefresh = () => {
    fetchAndStoreIpAddress();

    const intervalId = setInterval(fetchAndStoreIpAddress, IP_REFRESH_MS);
    return () => clearInterval(intervalId);
};
