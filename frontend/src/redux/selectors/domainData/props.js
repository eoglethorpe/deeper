import { isFalsy } from '../../../vendor/react-store/utils/common';

const getFromProps = identifier => ({ route }, props) => {
    if (!isFalsy(props) && !isFalsy(props[identifier])) {
        return props[identifier];
    }
    if (route.params) {
        return route.params[identifier];
    }
    return undefined;
};

export const afIdFromRoute = getFromProps('analysisFrameworkId');
export const ceIdFromRoute = getFromProps('categoryEditorId');
export const countryIdFromRoute = getFromProps('countryId');
export const groupIdFromRoute = getFromProps('userGroupId');
export const leadIdFromRoute = getFromProps('leadId');
export const projectIdFromRoute = getFromProps('projectId');
export const userIdFromRoute = getFromProps('userId');
export const connectorIdFromRoute = getFromProps('connectorId');
