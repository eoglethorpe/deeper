const initialAuthState = {
    authenticated: false,

    token: {
        access: undefined,
        refresh: undefined,
    },

    user: {
        userId: undefined,
        username: undefined,
        displayName: undefined,
        exp: undefined,
    },
};
export default initialAuthState;
