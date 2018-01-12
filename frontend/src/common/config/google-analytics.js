export const trackingIdDev = 'UA-112330910-2';
export const trackingIdProd = 'UA-112330910-1';

export const getTrackingId = () => {
    if (window.location.hostname.includes('thedeep.io')) {
        return trackingIdProd;
    }
    return trackingIdDev;
};
