import initialAuthState from '../initial-state/auth';
import {
    authReducers,
    LOGIN_ACTION,
    AUTHENTICATE_ACTION,
    LOGOUT_ACTION,
    SET_ACCESS_TOKEN_ACTION,
    loginAction,
    logoutAction,
    authenticateAction,
    setAccessTokenAction,
} from './auth.js';

test('should log in user', () => {
    const state = {
    };
    const action = loginAction({
        access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG5kb2VAdGVzdC5jb20iLCJleHAiOjE1MTM3Njk5NTEsImlzU3VwZXJ1c2VyIjpmYWxzZSwidG9rZW5UeXBlIjoiYWNjZXNzIiwiZGlzcGxheU5hbWUiOiJKb2huIERvZSIsInVzZXJJZCI6MX0.dIPL42ILAz7yfbPqfIIXkJqflqVAlfIok8cGF2D7_70',
        refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVHlwZSI6InJlZnJlc2gifQ.BlX4J4VIMXREIyO-fPBrMj1hswGIu79gZmGpbbE2PTE',
    });
    const after = {
        token: {
            access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG5kb2VAdGVzdC5jb20iLCJleHAiOjE1MTM3Njk5NTEsImlzU3VwZXJ1c2VyIjpmYWxzZSwidG9rZW5UeXBlIjoiYWNjZXNzIiwiZGlzcGxheU5hbWUiOiJKb2huIERvZSIsInVzZXJJZCI6MX0.dIPL42ILAz7yfbPqfIIXkJqflqVAlfIok8cGF2D7_70',
            refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVHlwZSI6InJlZnJlc2gifQ.BlX4J4VIMXREIyO-fPBrMj1hswGIu79gZmGpbbE2PTE',
        },
        activeUser: {
            exp: 1513769951,
            userId: 1,
        },
    };
    expect(authReducers[LOGIN_ACTION](state, action)).toEqual(after);
});

test('should authenticate user', () => {
    const state = {
    };
    const action = authenticateAction();
    const after = {
        authenticated: true,
    };
    expect(authReducers[AUTHENTICATE_ACTION](state, action)).toEqual(after);
});

test('should update access token', () => {
    const state = {
        token: {
            access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG5kb2VAdGVzdC5jb20iLCJleHAiOjE1MTM3Njk5NTEsImlzU3VwZXJ1c2VyIjpmYWxzZSwidG9rZW5UeXBlIjoiYWNjZXNzIiwiZGlzcGxheU5hbWUiOiJKb2huIERvZSIsInVzZXJJZCI6MX0.dIPL42ILAz7yfbPqfIIXkJqflqVAlfIok8cGF2D7_70',
            refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVHlwZSI6InJlZnJlc2gifQ.BlX4J4VIMXREIyO-fPBrMj1hswGIu79gZmGpbbE2PTE',
        },
        activeUser: {
            displayName: 'John Doe',
            exp: 1513769951,
            isSuperuser: false,
            userId: 1,
            username: 'johndoe@test.com',
        },
    };
    const action = setAccessTokenAction(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG5kb2VAdGVzdC5jb20iLCJleHAiOjE1MTM3NzA5NzMsImlzU3VwZXJ1c2VyIjpmYWxzZSwidG9rZW5UeXBlIjoiYWNjZXNzIiwiZGlzcGxheU5hbWUiOiJKb2huIERvZSIsInVzZXJJZCI6MX0.9pGs5r0NSZznd_a-tR_OwRybiKsZOsO49zGCmFBGm2U',
    );
    const after = {
        token: {
            access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG5kb2VAdGVzdC5jb20iLCJleHAiOjE1MTM3NzA5NzMsImlzU3VwZXJ1c2VyIjpmYWxzZSwidG9rZW5UeXBlIjoiYWNjZXNzIiwiZGlzcGxheU5hbWUiOiJKb2huIERvZSIsInVzZXJJZCI6MX0.9pGs5r0NSZznd_a-tR_OwRybiKsZOsO49zGCmFBGm2U',
            refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVHlwZSI6InJlZnJlc2gifQ.BlX4J4VIMXREIyO-fPBrMj1hswGIu79gZmGpbbE2PTE',
        },
        activeUser: {
            displayName: 'John Doe',
            exp: 1513770973,
            isSuperuser: false,
            userId: 1,
            username: 'johndoe@test.com',
        },
    };
    expect(authReducers[SET_ACCESS_TOKEN_ACTION](state, action)).toEqual(after);
});

test('should logout user', () => {
    const state = {
        token: {
            access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG5kb2VAdGVzdC5jb20iLCJleHAiOjE1MTM3Njk5NTEsImlzU3VwZXJ1c2VyIjpmYWxzZSwidG9rZW5UeXBlIjoiYWNjZXNzIiwiZGlzcGxheU5hbWUiOiJKb2huIERvZSIsInVzZXJJZCI6MX0.dIPL42ILAz7yfbPqfIIXkJqflqVAlfIok8cGF2D7_70',
            refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVHlwZSI6InJlZnJlc2gifQ.BlX4J4VIMXREIyO-fPBrMj1hswGIu79gZmGpbbE2PTE',
        },
        activeUser: {
            displayName: 'John Doe',
            exp: 1513769951,
            isSuperuser: false,
            userId: 1,
            username: 'johndoe@test.com',
        },
    };
    const action = logoutAction();
    const after = initialAuthState;
    expect(authReducers[LOGOUT_ACTION](state, action)).toEqual(after);
});
