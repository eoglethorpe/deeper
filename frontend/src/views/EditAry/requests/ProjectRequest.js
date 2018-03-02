import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import { isFalsy } from '../../../vendor/react-store/utils/common';
import {
    createUrlForProject,
    createParamsForUser,
} from '../../../rest';
import schema from '../../../schema';

export default class ProjectRequest {
    constructor(parent, params) {
        this.setState = (state) => {
            parent.setState(state);
        };

        const {
            setProject,
            startAryTemplateRequest,
        } = params;
        this.setProject = setProject;
        this.startAryTemplateRequest = startAryTemplateRequest;
    }

    create = (projectId) => {
        const projectRequest = new FgRestBuilder()
            .url(createUrlForProject(projectId))
            .params(() => createParamsForUser())
            .preLoad(() => { this.setState({ pending: true, noTemplate: false }); })
            .success((response) => {
                try {
                    schema.validate(response, 'projectGetResponse');
                    this.setProject({ project: response });
                    if (isFalsy(response.assessmentTemplate)) {
                        console.warn('There is no assessment template');
                        this.setState({ noTemplate: true, pending: false });
                    } else {
                        this.startAryTemplateRequest(response.assessmentTemplate);
                    }
                } catch (er) {
                    console.error(er);
                    this.setState({ pending: false });
                }
            })
            .failure((response) => {
                console.warn('Failure', response);
                this.setState({ pending: false });
            })
            .fatal((response) => {
                console.warn('Fatal', response);
                this.setState({ pending: false });
            })
            .build();
        return projectRequest;
    }
}

