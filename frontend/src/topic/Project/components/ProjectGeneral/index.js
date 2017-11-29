import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { RestBuilder } from '../../../../public/utils/rest';
import {
    createParamsForProjectPatch,
    createUrlForProject,
    createParamsForProjectOptions,
    createUrlForProjectOptions,
} from '../../../../common/rest';
import {
    activeProjectSelector,
    tokenSelector,

    projectDetailsSelector,
} from '../../../../common/redux';
import schema from '../../../../common/schema';

import ProjectGeneralForm from '../ProjectGeneralForm';
import styles from './styles.scss';

const propTypes = {
    activeProject: PropTypes.number,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line
    token: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    activeProject: undefined,
};

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectSelector(state),
    projectDetails: projectDetailsSelector(state, props),
    token: tokenSelector(state),
});

@connect(mapStateToProps, null)
@CSSModules(styles, { allowMultiple: true })
export default class ProjectGeneral extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            projectDetails,
            activeProject,
        } = props;

        const formValues = {
            ...projectDetails,
            regions: projectDetails.regions.map(region => region.id),
        };

        this.state = {
            formErrors: [],
            formFieldErrors: {},
            stale: false,
            pending: false,
            formValues,
        };

        this.projectOptionsRequest = this.createProjectOptionsRequest(activeProject);
    }

    componentWillMount() {
        this.projectOptionsRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps !== this.props) {
            this.setState({ formValues: { ...nextProps.projectDetails } });
        }
    }

    componentWillUnmount() {
        this.projectOptionsRequest.stop();
    }

    createProjectPatchRequest = () => {
        const projectPatchRequest = new RestBuilder()
            .url(createUrlForProject())
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForProjectPatch(
                    { access },
                );
            })
            .success((response) => {
                try {
                    schema.validate(response, 'project');
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return projectPatchRequest;
    };

    createProjectOptionsRequest = (projectId) => {
        const projectOptionsRequest = new RestBuilder()
            .url(createUrlForProjectOptions(projectId))
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForProjectOptions({ access });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'projectOptionsGetResponse');
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return projectOptionsRequest;
    };

    // FORM RELATED
    changeCallback = (values, { formErrors, formFieldErrors }) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    handleFormCancel = () => {
        console.log();
    };

    successCallback = (values) => {
        console.log(values);
        // Rest Request goes here
    };

    render() {
        const {
            formErrors,
            formFieldErrors,
            stale,
            pending,
            formValues,
        } = this.state;

        return (
            <div styleName="project-general">
                <ProjectGeneralForm
                    formValues={formValues}
                    formErrors={formErrors}
                    formFieldErrors={formFieldErrors}
                    changeCallback={this.changeCallback}
                    failureCallback={this.failureCallback}
                    handleFormCancel={this.handleFormCancel}
                    successCallback={this.successCallback}
                    stale={stale}
                    pending={pending}
                />
            </div>
        );
    }
}
