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
        displayName: undefined, // can change later
        exp: undefined,
    },
};
export default initialAuthState;
