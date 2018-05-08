import stringFormat from 'string-format';
import devLang from './redux/initial-state/dev-lang';

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
    let str = getString(selectedStrings, selectedLinks, namespace, identifier);

    // If string is not in selected language, get from fallback language
    if (!str) {
        const fallbackStrings = fallbackStringsSelector(state);
        const fallbackLinks = fallbackLinksSelector(state);
        str = getString(fallbackStrings, fallbackLinks, namespace, identifier);
    }
    // If string is not in fallback language, get from dev language
    if (!str) {
        str = getString(devLang.strings, devLang.links, namespace, identifier);
    }
    // If string is not in dev language, show identifiers
    if (!str) {
        str = `{${namespace}:${identifier}}`;
    } else if (params) {
        str = stringFormat(str, params);
    }
    return str;
};

export default _ts;
