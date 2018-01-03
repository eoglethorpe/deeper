export const userIdFromRoute = (state, { match }) => match.params.userId;
export const groupIdFromRoute = (state, { match }) => match.params.userGroupId;
export const countryIdFromProps = (state, { match }) => match.params.countryId;
export const projectIdFromRoute = (state, { match }) => match.params.projectId;
export const analysisFrameworkIdFromProps = (state, { match }) => match.params.analysisFrameworkId;
export const categoryEditorIdFromProps = (state, { match }) => match.params.categoryEditorId;
export const leadIdFromRoute = (state, { match }) => match.params.leadId;
export const categoryEditorIdFromRoute = (state, { match }) => match.params.categoryEditorId;

export const regionIdFromProps = (state, { regionId }) => regionId;
export const userGroupIdFromProps = (state, { userGroupId }) => userGroupId;
export const analysisFrameworkIdFromPropsForProject = (state, { afId }) => afId;
export const categoryEditorIdFromPropsForProject = (state, { ceId }) => ceId;
