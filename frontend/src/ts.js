import stringFormat from 'string-format';

import { selectedLinksSelector, selectedStringsSelector } from './redux';
import store from './store';

// eslint-disable-next-line no-underscore-dangle
const _ts = (namespace, identifier, params) => {
    const state = store.getState();

    const selectedStrings = selectedStringsSelector(state);
    const selectedLinks = selectedLinksSelector(state);

    const namedLinkStrings = selectedLinks[namespace];

    const id = namedLinkStrings ? namedLinkStrings[identifier] : undefined;
    const str = id ? selectedStrings[id] : undefined;

    if (!str) {
        return `{${namespace}:${identifier}}`;
    }
    return params ? stringFormat(str, params) : str;
};

export default _ts;
