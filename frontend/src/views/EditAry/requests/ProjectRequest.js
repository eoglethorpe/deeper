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
            .preLoad(() => { this.setState({ pendingAryTemplate: true, noTemplate: false }); })
            .success((response) => {
                try {
                    schema.validate(response, 'projectGetResponse');
                    this.setProject({ project: response });

                    if (isFalsy(response.assessmentTemplate)) {
                        this.setState({ noTemplate: true, pendingAryTemplate: true });
                    } else {
                        const assessmentTemplateId = response.assessmentTemplate;
                        this.startAryTemplateRequest(assessmentTemplateId);
                    }
                } catch (er) {
                    console.error(er);
                    this.setState({ pendingAryTemplate: false });
                }
            })
            .failure((response) => {
                console.warn('Failure', response);
                this.setState({ pendingAryTemplate: false });
            })
            .fatal((response) => {
                console.warn('Fatal', response);
                this.setState({ pendingAryTemplate: false });
            })
            .build();
        return projectRequest;
    }
}

