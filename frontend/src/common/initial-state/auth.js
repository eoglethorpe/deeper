const initialAuthState = {
    authenticted: false,

    token: {
        access: undefined,
        refresh: undefined,
    },

    user: {
        email: undefined,
    },
};
export default initialAuthState;
