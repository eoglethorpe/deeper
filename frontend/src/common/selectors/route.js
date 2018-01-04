const emptyObject = {};

// eslint-disable-next-line import/prefer-default-export
export const routeParamsSelector = ({ route }) => (
    route.params || emptyObject
);
