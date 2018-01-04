import { isFalsy } from '../../../public/utils/common';

const getFromProps = identifier => (state, props) => {
    if (!isFalsy(props[identifier])) {
        return props[identifier];
    }
    // TODO: read from state later instead of match
    if (props.match) {
        return props.match.params[identifier];
    }
    return undefined;
};

export const afIdFromRoute = getFromProps('analysisFrameworkId');
export const ceIdFromRoute = getFromProps('categoryEditorId');
export const countryIdFromRoute = getFromProps('countryId');
export const groupIdFromRoute = getFromProps('userGroupId');
export const leadIdFromRoute = getFromProps('leadId');
export const projectIdFromRoute = getFromProps('projectId');
export const regionIdFromRoute = getFromProps('regionId');
export const userIdFromRoute = getFromProps('userId');
