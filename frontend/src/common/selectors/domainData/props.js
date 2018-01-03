export const userIdFromRoute = (state, { match }) => match.params.userId;
export const groupIdFromRoute = (state, { match }) => match.params.userGroupId;
export const countryIdFromRoute = (state, { match }) => match.params.countryId;
export const projectIdFromRoute = (state, { match }) => match.params.projectId;
export const leadIdFromRoute = (state, { match }) => match.params.leadId;
export const afIdFromRoute = (state, { match }) => match.params.analysisFrameworkId;
export const ceIdFromRoute = (state, { match }) => match.params.categoryEditorId;

// has both cases to be considered
export const regionIdFromProps = (state, { regionId }) => regionId;
export const userGroupIdFromProps = (state, { userGroupId }) => userGroupId;
export const afIdFromProps = (state, { afId }) => afId;
export const ceIdFromProps = (state, { ceId }) => ceId;
