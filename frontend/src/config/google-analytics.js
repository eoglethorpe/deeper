import ReactGA from 'react-ga';

export const trackingIdDev = 'UA-112330910-2';
export const trackingIdProd = 'UA-112330910-1';

export const getTrackingId = () => {
    if (window.location.hostname.includes('thedeep.io')) {
        return trackingIdProd;
    } else if (window.location.hostname.includes('togglecorp.com')) {
        return trackingIdDev;
    }
    return 'none';
};

export const gaConfig = () => ({
    // debug: trackingId === 'none',
    gaOptions: {
        forceSSL: true,
        userId: undefined,
        hostname: window.location.hostname,
    },
});


export const initializeGa = () => {
    const trackingId = getTrackingId();
    const config = gaConfig();

    ReactGA.initialize(trackingId, config);
};

export const gaIsInitialize = () => (window.ga && window.ga.create);

export const setGaUserId = (userId) => {
    if (gaIsInitialize()) {
        ReactGA.set({ userId });
    }
};
