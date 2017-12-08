import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { FgRestBuilder } from '../../../../public/utils/rest';
import {
    PrimaryButton,
} from '../../../../public/components/Action';
import {
    createParamsForProjectPatch,
    createUrlForProject,

    createUrlForAfClone,
    createParamsForAfClone,
    createParamsForAnalysisFrameworkEdit,
    createUrlForAnalysisFramework,
} from '../../../../common/rest';
import {
    Confirm,
} from '../../../../public/components/View';
import {
    analysisFrameworkDetailSelector,
    tokenSelector,
    projectDetailsSelector,

    setProjectAfAction,
    setAfDetailAction,
    addNewAfAction,
} from '../../../../common/redux';
import schema from '../../../../common/schema';

import {
    reverseRoute,
} from '../../../../public/utils/common';

import {
    iconNames,
    pathNames,
} from '../../../../common/constants';

import ProjectAfForm from '../ProjectAfForm';
import styles from './styles.scss';

const propTypes = {
    afDetails: PropTypes.object.isRequired, // eslint-disable-line
    afId: PropTypes.number,
    addNewAf: PropTypes.func.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line
    setProjectAf: PropTypes.func.isRequired,
    setAfDetail: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    afId: undefined,
};

const mapStateToProps = (state, props) => ({
    afDetails: analysisFrameworkDetailSelector(state, props),
    token: tokenSelector(state),
    projectDetails: projectDetailsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    addNewAf: params => dispatch(addNewAfAction(params)),
    setProjectAf: params => dispatch(setProjectAfAction(params)),
    setAfDetail: params => dispatch(setAfDetailAction(params)),
    dispatch,
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class ProjectAfDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { afDetails } = props;

        this.state = {
            cloneConfirmModalShow: false,
            useConfirmModalShow: false,

            formValues: { ...afDetails },
            formErrors: [],
            formFieldErrors: {},
            stale: false,
            pending: false,

            redirectTo: undefined,
        };
    }

    createProjectPatchRequest = (afId, projectId) => {
        const projectPatchRequest = new FgRestBuilder()
            .url(createUrlForProject(projectId))
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForProjectPatch(
                    { access },
                    { analysisFramework: afId },
                );
            })
            .success((response) => {
                try {
                    schema.validate(response, 'project');
                    this.props.setProjectAf({
                        projectId,
                        afId,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return projectPatchRequest;
    };

    createAfCloneRequest = (afId, projectId) => {
        const afCloneRequest = new FgRestBuilder()
            .url(createUrlForAfClone(afId))
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForAfClone(
                    { access },
                    { project: projectId },
                );
            })
            .success((response) => {
                try {
                    schema.validate(response, 'analysisFramework');
                    this.props.addNewAf({
                        afDetail: response,
                        projectId,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return afCloneRequest;
    };

    createAfPutRequest = ({ title, description }) => {
        const { afId } = this.props;
        const afPutRequest = new FgRestBuilder()
            .url(createUrlForAnalysisFramework(afId))
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForAnalysisFrameworkEdit(
                    { access },
                    { title, description },
                );
            })
            .success((response) => {
                try {
                    schema.validate(response, 'analysisFramework');
                    this.props.setAfDetail({
                        afId,
                        afDetail: response,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return afPutRequest;
    };

    handleAfClone = (cloneConfirm, afId, projectId) => {
        if (cloneConfirm) {
            if (this.afCloneRequest) {
                this.afCloneRequest.stop();
            }

            this.afCloneRequest = this.createAfCloneRequest(afId, projectId);
            this.afCloneRequest.start();
        }
        this.setState({ cloneConfirmModalShow: false });
    }

    handleAfUse = (useConfirm, afId, projectId) => {
        if (useConfirm) {
            if (this.projectPatchRequest) {
                this.projectPatchRequest.stop();
            }

            this.projectPatchRequest = this.createProjectPatchRequest(afId, projectId);
            this.projectPatchRequest.start();
        }
        this.setState({ useConfirmModalShow: false });
    }

    handleAfCloneClick = () => {
        this.setState({ cloneConfirmModalShow: true });
    }

    handleAfUseClick = () => {
        this.setState({ useConfirmModalShow: true });
    }

    // FORM RELATED
    changeCallback = (values, { formErrors, formFieldErrors }) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
            stale: true,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
            stale: false,
        });
    };

    handleFormCancel = () => {
        const { afDetails } = this.props;

        this.setState({
            formValues: { ...afDetails },
            formErrors: [],
            formFieldErrors: {},
            stale: false,
            pending: false,
        });
    };

    successCallback = (values) => {
        if (this.afPutRequest) {
            this.afPutRequest.stop();
        }

        this.afPutRequest = this.createAfPutRequest(values);
        this.afPutRequest.start();
        this.setState({ stale: false });
    };

    handleAfEditClick = () => {
        const {
            afId,
        } = this.props;

        const params = {
            analysisFrameworkId: afId,
        };

        this.setState({
            redirectTo: reverseRoute(pathNames.analysisFramework, params),
        });
    }

    render() {
        const {
            afDetails,
            afId,
            projectDetails,
        } = this.props;

        const {
            cloneConfirmModalShow,
            useConfirmModalShow,
            formErrors,
            formFieldErrors,
            stale,
            pending,
            formValues,

            redirectTo,
        } = this.state;

        if (redirectTo) {
            return (
                <Redirect
                    to={redirectTo}
                    push
                />
            );
        }

        const isProjectAf = afId === projectDetails.analysisFramework;

        return (
            <div styleName="analysis-framework-detail">
                <header styleName="header">
                    <h2>
                        {afDetails.title}
                    </h2>
                    <div styleName="action-btns">
                        {!isProjectAf &&
                            <PrimaryButton
                                iconName={iconNames.check}
                                onClick={this.handleAfUseClick}
                            >
                                Use
                            </PrimaryButton>
                        }
                        {afDetails.isAdmin &&
                            <PrimaryButton
                                iconName={iconNames.edit}
                                onClick={this.handleAfEditClick}
                            >
                                Edit
                            </PrimaryButton>
                        }
                        <PrimaryButton
                            onClick={this.handleAfCloneClick}
                        >
                            Clone and Edit
                        </PrimaryButton>
                    </div>
                    <Confirm
                        show={useConfirmModalShow}
                        onClose={useConfirm => this.handleAfUse(
                            useConfirm, afId, projectDetails.id)}
                    >
                        <p>{`Are you sure you want to use ${afDetails.title}?`}</p>
                        <p>If you use this analysis framework, you will recieve
                            updates if the owner updates it</p>
                    </Confirm>
                    <Confirm
                        show={cloneConfirmModalShow}
                        onClose={cloneConfirm => this.handleAfClone(
                            cloneConfirm, afId, projectDetails.id)}
                    >
                        <p>{`Are you sure you want to clone ${afDetails.title}?`}</p>
                        <p>After cloning and editing this analysis framework,
                            you will not recieve any updates made by owner.</p>
                    </Confirm>
                </header>
                <div styleName="af-details">
                    <ProjectAfForm
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
            </div>
        );
    }
}
