import stringFormat from 'string-format';

import {
    selectedLinksSelector,
    selectedStringsSelector,
    fallbackLinksSelector,
    fallbackStringsSelector,
} from './redux';
import store from './store';

const getString = (strings, links, namespace, identifier) => {
    const namedLinkStrings = links[namespace];
    const linkName = namedLinkStrings ? namedLinkStrings[identifier] : undefined;
    return linkName ? strings[linkName] : undefined;
};

// eslint-disable-next-line no-underscore-dangle
const _ts = (namespace, identifier, params) => {
    const state = store.getState();

    const selectedStrings = selectedStringsSelector(state);
    const selectedLinks = selectedLinksSelector(state);

    const fallbackStrings = fallbackStringsSelector(state);
    const fallbackLinks = fallbackLinksSelector(state);

    let str = getString(selectedStrings, selectedLinks, namespace, identifier);
    if (!str) {
        str = getString(fallbackStrings, fallbackLinks, namespace, identifier);
    }

    if (!str) {
        str = `{${namespace}:${identifier}}`;
    } else if (params) {
        str = stringFormat(str, params);
    }
    return str;
};

export default _ts;
