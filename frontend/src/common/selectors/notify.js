// NOTE: Use these to make sure reference don't change
const emptyObject = {};

// eslint-disable-next-line import/prefer-default-export
export const lastNotifySelector = ({ notify }) => (
    notify.notifications[0] || emptyObject
);
