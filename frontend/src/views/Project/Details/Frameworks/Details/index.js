import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { reverseRoute } from '../../../../../vendor/react-store/utils/common';
import { FgRestBuilder } from '../../../../../vendor/react-store/utils/rest';
import AccentButton from '../../../../../vendor/react-store/components/Action/Button/AccentButton';
import WarningButton from '../../../../../vendor/react-store/components/Action/Button/WarningButton';
import LoadingAnimation from '../../../../../vendor/react-store/components/View/LoadingAnimation';
import Confirm from '../../../../../vendor/react-store/components/View/Modal/Confirm';
import Faram, {
    requiredCondition,
} from '../../../../../vendor/react-store/components/Input/Faram';
import DangerButton from '../../../../../vendor/react-store/components/Action/Button/DangerButton';
import SuccessButton from '../../../../../vendor/react-store/components/Action/Button/SuccessButton';
import NonFieldErrors from '../../../../../vendor/react-store/components/Input/NonFieldErrors';
import TextInput from '../../../../../vendor/react-store/components/Input/TextInput';
import TextArea from '../../../../../vendor/react-store/components/Input/TextArea';

import {
    createParamsForProjectPatch,
    createUrlForProject,
    createUrlForAfClone,
    createParamsForAfClone,
    createParamsForAnalysisFrameworkEdit,
    createUrlForAnalysisFramework,
} from '../../../../../rest';
import {
    analysisFrameworkDetailSelector,
    projectDetailsSelector,
    setProjectAfAction,
    setAfDetailAction,
    addNewAfAction,
} from '../../../../../redux';
import {
    iconNames,
    pathNames,
} from '../../../../../constants';
import schema from '../../../../../schema';
import notify from '../../../../../notify';
import _ts from '../../../../../ts';

import styles from './styles.scss';

const propTypes = {
    frameworkDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    analysisFrameworkId: PropTypes.number.isRequired,
    addNewAf: PropTypes.func.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setProjectFramework: PropTypes.func.isRequired,
    setFrameworkDetails: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    frameworkDetails: analysisFrameworkDetailSelector(state, props),
    projectDetails: projectDetailsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    addNewAf: params => dispatch(addNewAfAction(params)),
    setProjectFramework: params => dispatch(setProjectAfAction(params)),
    setFrameworkDetails: params => dispatch(setAfDetailAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectAfDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { frameworkDetails } = props;

        this.state = {
            cloneConfirmModalShow: false,
            useConfirmModalShow: false,

            faramValues: { ...frameworkDetails },
            faramErrors: {},
            pristine: false,
            pending: false,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
                description: [],
            },
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
                    this.props.setProjectFramework({
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
                    this.props.setFrameworkDetails({
                        afId,
                        afDetail: response,
                    });
                    notify.send({
                        title: _ts('notification', 'afFormEdit'),
                        type: notify.type.SUCCESS,
                        message: _ts('notification', 'afFormEditSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure(() => {
                notify.send({
                    title: _ts('notification', 'afFormEdit'),
                    type: notify.type.ERROR,
                    message: _ts('notification', 'afFormEditFailure'),
                    duration: notify.duration.SLOW,
                });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('notification', 'afFormEdit'),
                    type: notify.type.ERROR,
                    message: _ts('notification', 'afFormEditFatal'),
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

    handlefaramCancel = () => {
        const { frameworkDetails } = this.props;

        this.setState({
            faramValues: { ...frameworkDetails },
            faramErrors: {},

            pristine: false,
            pending: false,
        });
    };

    // faram RELATED
    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    };

    handleValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            pristine: false,
        });
    };

    handleValidationSuccess = (values) => {
        if (this.afPutRequest) {
            this.afPutRequest.stop();
        }

        this.afPutRequest = this.createAfPutRequest(values);
        this.afPutRequest.start();
        this.setState({ pristine: false });
    };

    renderUseFrameworkButton = () => {
        const {
            analysisFrameworkId,
            projectDetails,
        } = this.props;

        if (analysisFrameworkId === projectDetails.analysisFramework) {
            return null;
        }

        const { pending } = this.state;
        const useFrameworkButtonLabel = _ts('project', 'useAfButtonLabel');

        return (
            <WarningButton
                iconName={iconNames.check}
                onClick={this.handleAfUseClick}
                disabled={pending}
            >
                { useFrameworkButtonLabel }
            </WarningButton>
        );
    }

    renderEditFrameworkButton = () => {
        const {
            analysisFrameworkId,
            frameworkDetails,
        } = this.props;

        if (!frameworkDetails.isAdmin) {
            return null;
        }

        const { pending } = this.state;
        const editFrameworkButtonLabel = _ts('project', 'editAfButtonLabel');

        const params = {
            analysisFrameworkId,
        };

        return (
            <Link
                className={styles.editFrameworkLink}
                to={reverseRoute(pathNames.analysisFramework, params)}
                disabled={pending}
            >
                { editFrameworkButtonLabel }
            </Link>
        );
    }

    renderHeader = () => {
        const { frameworkDetails } = this.props;
        const { pending } = this.state;

        const UseFrameworkButton = this.renderUseFrameworkButton;
        const EditFrameworkButton = this.renderEditFrameworkButton;

        const cloneAndEditFrameworkButtonLabel = _ts('project', 'cloneEditAfButtonLabel');

        return (
            <header className={styles.header}>
                <h2>
                    {frameworkDetails.title}
                </h2>
                <div className={styles.actionButtons}>
                    <UseFrameworkButton />
                    <EditFrameworkButton />
                    <AccentButton
                        onClick={this.handleAfCloneClick}
                        disabled={pending}
                    >
                        { cloneAndEditFrameworkButtonLabel }
                    </AccentButton>
                </div>
            </header>
        );
    }

    render() {
        const {
            frameworkDetails,
            analysisFrameworkId,
            projectDetails,
        } = this.props;

        const {
            cloneConfirmModalShow,
            useConfirmModalShow,
            faramErrors,
            pristine,
            pending,
            faramValues,
        } = this.state;

        const Header = this.renderHeader;
        const readOnly = !frameworkDetails.isAdmin;

        return (
            <div className={styles.analysisFrameworkDetail}>
                { pending && <LoadingAnimation /> }
                <Header />
                <Faram
                    className={styles.afDetailForm}
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleValidationFailure}
                    onValidationSuccess={this.handleValidationSuccess}
                    schema={this.schema}
                    value={faramValues}
                    error={faramErrors}
                    disabled={pending}
                >
                    { !readOnly &&
                        <div className={styles.actionButtons}>
                            <DangerButton
                                onClick={this.handlefaramCancel}
                                disabled={pending || !pristine}
                            >
                                {_ts('project', 'modalRevert')}
                            </DangerButton>
                            <SuccessButton
                                disabled={pending || !pristine}
                                type="submit"
                            >
                                {_ts('project', 'modalSave')}
                            </SuccessButton>
                        </div>
                    }
                    <NonFieldErrors faramElement />
                    <TextInput
                        label={_ts('project', 'addAfTitleLabel')}
                        faramElementName="title"
                        placeholder={_ts('project', 'addAfTitlePlaceholder')}
                        className={styles.name}
                        readOnly={readOnly}
                    />
                    <TextArea
                        label={_ts('project', 'projectDescriptionLabel')}
                        faramElementName="description"
                        placeholder={_ts('project', 'projectDescriptionPlaceholder')}
                        className={styles.description}
                        rows={3}
                        readOnly={readOnly}
                    />
                </Faram>
                <Confirm
                    show={useConfirmModalShow}
                    onClose={useConfirm => this.handleAfUse(
                        useConfirm, analysisFrameworkId, projectDetails.id,
                    )}
                >
                    <p>
                        { _ts('project', 'confirmUseAf', { title: frameworkDetails.title }) }
                    </p>
                    <p>
                        { _ts('project', 'confirmUseAfText') }
                    </p>
                </Confirm>
                <Confirm
                    show={cloneConfirmModalShow}
                    onClose={cloneConfirm => this.handleAfClone(
                        cloneConfirm, analysisFrameworkId, projectDetails.id,
                    )}
                >
                    <p>
                        { _ts('project', 'confirmCloneAf', { title: frameworkDetails.title }) }
                    </p>
                </Confirm>
            </div>
        );
    }
}
