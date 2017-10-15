const initialAuthState = {
    authenticated: false,

    token: {
        access: undefined,
        refresh: undefined,
    },

    // currently logged-in user-detail
    activeUser: {
        userId: undefined,
        username: undefined,
        displayName: undefined,
        exp: undefined,
    },
};
export default initialAuthState;
