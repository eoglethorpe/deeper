import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../../public/utils/rest';
import ImagesSlider from '../../../../common/components/ImagesSlider';

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
    LoadingAnimation,
    Confirm,
} from '../../../../public/components/View';
import {
    analysisFrameworkDetailSelector,
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
    notificationStrings,
} from '../../../../common/constants';
import notify from '../../../../common/notify';
import ProjectAfForm from '../ProjectAfForm';
import styles from './styles.scss';

const propTypes = {
    afDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    analysisFrameworkId: PropTypes.number.isRequired,
    addNewAf: PropTypes.func.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setProjectAf: PropTypes.func.isRequired,
    setAfDetail: PropTypes.func.isRequired,
    mainHistory: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    afDetails: analysisFrameworkDetailSelector(state, props),
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
            pristine: false,
            pending: false,
        };
    }

    componentWillUnmount() {
        if (this.projectPatchRequest) {
            this.projectPatchRequest.stop();
        }
        if (this.afPutRequest) {
            this.afPutRequest.stop();
        }
        if (this.afCloneRequest) {
            this.afCloneRequest.stop();
        }
    }

    createProjectPatchRequest = (afId, projectId) => {
        const projectPatchRequest = new FgRestBuilder()
            .url(createUrlForProject(projectId))
            .params(() => createParamsForProjectPatch({ analysisFramework: afId }))
            .preLoad(() => this.setState({ pending: true }))
            .postLoad(() => this.setState({ pending: false }))
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
            .params(() => createParamsForAfClone({ project: projectId }))
            .preLoad(() => this.setState({ pending: true }))
            .postLoad(() => this.setState({ pending: false }))
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
        const { analysisFrameworkId: afId } = this.props;
        const afPutRequest = new FgRestBuilder()
            .url(createUrlForAnalysisFramework(afId))
            .params(() => createParamsForAnalysisFrameworkEdit({ title, description }))
            .preLoad(() => this.setState({ pending: true }))
            .postLoad(() => this.setState({ pending: false }))
            .success((response) => {
                try {
                    schema.validate(response, 'analysisFramework');
                    this.props.setAfDetail({
                        afId,
                        afDetail: response,
                    });
                    notify.send({
                        title: notificationStrings.afFormEdit,
                        type: notify.type.SUCCESS,
                        message: notificationStrings.afFormEditSuccess,
                        duration: notify.duration.MEDIUM,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure(() => {
                notify.send({
                    title: notificationStrings.afFormEdit,
                    type: notify.type.ERROR,
                    message: notificationStrings.afFormEditFailure,
                    duration: notify.duration.SLOW,
                });
            })
            .fatal(() => {
                notify.send({
                    title: notificationStrings.afFormEdit,
                    type: notify.type.ERROR,
                    message: notificationStrings.afFormEditFatal,
                    duration: notify.duration.SLOW,
                });
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
            pristine: true,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
            pristine: false,
        });
    };

    handleFormCancel = () => {
        const { afDetails } = this.props;

        this.setState({
            formValues: { ...afDetails },
            formErrors: [],
            formFieldErrors: {},
            pristine: false,
            pending: false,
        });
    };

    successCallback = (values) => {
        if (this.afPutRequest) {
            this.afPutRequest.stop();
        }

        this.afPutRequest = this.createAfPutRequest(values);
        this.afPutRequest.start();
        this.setState({ pristine: false });
    };

    handleAfEditClick = () => {
        const {
            analysisFrameworkId,
            mainHistory,
        } = this.props;

        const params = {
            analysisFrameworkId,
        };

        mainHistory.push(reverseRoute(pathNames.analysisFramework, params));
    }

    render() {
        const {
            afDetails,
            analysisFrameworkId,
            projectDetails,
        } = this.props;

        const {
            cloneConfirmModalShow,
            useConfirmModalShow,
            formErrors,
            formFieldErrors,
            pristine,
            pending,
            formValues,
        } = this.state;

        const isProjectAf = analysisFrameworkId === projectDetails.analysisFramework;
        const snapshots = [];
        if (afDetails.snapshotOne) {
            snapshots.push(afDetails.snapshotOne);
        }
        if (afDetails.snapshotTwo) {
            snapshots.push(afDetails.snapshotTwo);
        }

        return (
            <div styleName="analysis-framework-detail">
                { pending && <LoadingAnimation /> }
                <header styleName="header">
                    <h2>
                        {afDetails.title}
                    </h2>
                    <div styleName="action-btns">
                        {!isProjectAf &&
                            <PrimaryButton
                                iconName={iconNames.check}
                                onClick={this.handleAfUseClick}
                                disabled={pending}
                            >
                                Use
                            </PrimaryButton>
                        }
                        {afDetails.isAdmin &&
                            <PrimaryButton
                                iconName={iconNames.edit}
                                onClick={this.handleAfEditClick}
                                disabled={pending}
                            >
                                Edit
                            </PrimaryButton>
                        }
                        <PrimaryButton
                            onClick={this.handleAfCloneClick}
                            disabled={pending}
                        >
                            {'Clone & Edit'}
                        </PrimaryButton>
                    </div>
                    <Confirm
                        show={useConfirmModalShow}
                        onClose={useConfirm => this.handleAfUse(
                            useConfirm, analysisFrameworkId, projectDetails.id,
                        )}
                    >
                        <p>{`Are you sure you want to use ${afDetails.title}?`}</p>
                        <p>If you use this analysis framework, you will recieve
                            updates if the owner updates it</p>
                    </Confirm>
                    <Confirm
                        show={cloneConfirmModalShow}
                        onClose={cloneConfirm => this.handleAfClone(
                            cloneConfirm, analysisFrameworkId, projectDetails.id,
                        )}
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
                        styleName="project-af-form"
                        pristine={pristine}
                        pending={pending}
                    />
                    <ImagesSlider
                        styleName="images-container"
                        galleryIds={snapshots}
                    />
                </div>
            </div>
        );
    }
}
