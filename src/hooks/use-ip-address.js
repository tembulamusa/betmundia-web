import { useEffect } from 'react';
import { startIpAddressRefresh } from '../components/utils/ip-address';

const useIpAddress = () => {
    useEffect(() => {
        return startIpAddressRefresh();
    }, []);
};

export default useIpAddress;
