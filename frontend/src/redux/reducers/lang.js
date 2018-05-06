import createReducerWithMap from '../../utils/createReducerWithMap';
import { LOGOUT_ACTION } from '../reducers/auth';
import initialLangState from '../initial-state/lang';
import update from '../../vendor/react-store/utils/immutable-update';

export const SET_SELECTED_LANGUAGE_ACTION = 'lang/SET_SELECTED_LANGUAGE';
export const SET_FALLBACK_LANGUAGE_ACTION = 'lang/SET_FALLBACK_LANGUAGE';

export const setSelectedLanguageAction = languageCode => ({
    type: SET_SELECTED_LANGUAGE_ACTION,
    languageCode,
});
export const setFallbackLanguageAction = languageCode => ({
    type: SET_FALLBACK_LANGUAGE_ACTION,
    languageCode,
});

const logout = () => initialLangState;

const setSelectedLanguage = (state, action) => {
    const { languageCode } = action;
    const settings = {
        selectedLanguage: { $set: languageCode },
    };
    return update(state, settings);
};

const setFallbackLanguage = (state, action) => {
    const { languageCode } = action;
    const settings = {
        fallbackLanguage: { $set: languageCode },
    };
    return update(state, settings);
};

export const langReducers = {
    [LOGOUT_ACTION]: logout,
    [SET_SELECTED_LANGUAGE_ACTION]: setSelectedLanguage,
    [SET_FALLBACK_LANGUAGE_ACTION]: setFallbackLanguage,
};

const langReducer = createReducerWithMap(langReducers, initialLangState);
export default langReducer;
