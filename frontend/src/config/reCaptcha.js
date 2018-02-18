const getSiteKey = () => {
    if (process.env.NODE_ENV === 'development') {
        return '6LcsukYUAAAAAIUqQIAAx966JSRnwhdWbR4V-LTb';
    }
    return '6LfhyEYUAAAAAObS-Vi5g_E4SFDfGnt_iswkJ9r8';
};

// eslint-disable-next-line
export const reCaptchaSiteKey = getSiteKey();
