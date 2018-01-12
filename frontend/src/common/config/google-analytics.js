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

export const gaConfig = (trackingId, user) => ({
    // debug: trackingId === 'none',
    gaOptions: {
        forceSSL: true,
        userId: user.userId,
        hostname: window.location.hostname,
    },
});


export const initializeGa = (user = {}) => {
    const trackingId = getTrackingId();
    const config = gaConfig(trackingId, user);

    ReactGA.initialize(trackingId, config);
};

export const gaIsInitialize = () => (window.ga && window.ga.create);

export const setGaUserId = (user) => {
    if (gaIsInitialize()) {
        ReactGA.set({ userId: user.userId });
    }
};
