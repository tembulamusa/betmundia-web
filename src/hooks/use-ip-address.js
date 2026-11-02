import { useEffect } from 'react';
import { startIpAddressRefresh } from '../components/utils/ip-address';
import { scheduleIdle } from '../components/utils/defer-idle';

const useIpAddress = () => {
    useEffect(() => {
        let stopRefresh = null;
        const cancelIdle = scheduleIdle(() => {
            stopRefresh = startIpAddressRefresh();
        }, 2800);
        return () => {
            cancelIdle();
            if (typeof stopRefresh === 'function') stopRefresh();
        };
    }, []);
};

export default useIpAddress;
