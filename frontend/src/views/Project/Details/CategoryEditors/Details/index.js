import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../../../vendor/react-store/utils/rest';
import { reverseRoute } from '../../../../../vendor/react-store/utils/common';
import AccentButton from '../../../../../vendor/react-store/components/Action/Button/AccentButton';
import WarningButton from '../../../../../vendor/react-store/components/Action/Button/WarningButton';
import LoadingAnimation from '../../../../../vendor/react-store/components/View/LoadingAnimation';
import Confirm from '../../../../../vendor/react-store/components/View/Modal/Confirm';

import {
    createParamsForProjectPatch,
    createUrlForProject,

    createUrlForCeClone,
    createParamsForCeClone,
    createParamsForCeEdit,
    createUrlForCategoryEditor,
} from '../../../../../rest';
import {
    categoryEditorDetailSelector,
    projectDetailsSelector,

    setProjectCeAction,
    setCeDetailAction,
    addNewCeAction,
} from '../../../../../redux';
import schema from '../../../../../schema';
import _ts from '../../../../../ts';
import {
    iconNames,
    pathNames,
} from '../../../../../constants';

import Form from './Form';
import styles from './styles.scss';

const propTypes = {
    ceDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    categoryEditorId: PropTypes.number.isRequired,
    addNewCe: PropTypes.func.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setProjectCe: PropTypes.func.isRequired,
    setCeDetail: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    ceDetails: categoryEditorDetailSelector(state, props),
    projectDetails: projectDetailsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    addNewCe: params => dispatch(addNewCeAction(params)),
    setProjectCe: params => dispatch(setProjectCeAction(params)),
    setCeDetail: params => dispatch(setCeDetailAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectCeDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { ceDetails } = props;

        this.state = {
            cloneConfirmModalShow: false,
            useConfirmModalShow: false,

            formValues: { ...ceDetails },
            formErrors: {},
            formFieldErrors: {},
            pristine: false,
            pending: false,
        };
    }

    componentWillUnmount() {
        if (this.projectPatchRequest) {
            this.projectPatchRequest.stop();
        }
        if (this.cePutRequest) {
            this.cePutRequest.stop();
        }
        if (this.ceCloneRequest) {
            this.ceCloneRequest.stop();
        }
    }

    createProjectPatchRequest = (ceId, projectId) => {
        const projectPatchRequest = new FgRestBuilder()
            .url(createUrlForProject(projectId))
            .params(() => createParamsForProjectPatch({ categoryEditor: ceId }))
            .preLoad(() => this.setState({ pending: true }))
            .postLoad(() => this.setState({ pending: false }))
            .success((response) => {
                try {
                    schema.validate(response, 'project');
                    this.props.setProjectCe({
                        projectId,
                        ceId,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return projectPatchRequest;
    };

    createCeCloneRequest = (ceId, projectId) => {
        const ceCloneRequest = new FgRestBuilder()
            .url(createUrlForCeClone(ceId))
            .params(() => createParamsForCeClone({ project: projectId }))
            .preLoad(() => this.setState({ pending: true }))
            .postLoad(() => this.setState({ pending: false }))
            .success((response) => {
                try {
                    schema.validate(response, 'categoryEditor');
                    this.props.addNewCe({
                        ceDetail: response,
                        projectId,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return ceCloneRequest;
    };

    createCePutRequest = ({ title }) => {
        const { categoryEditorId: ceId } = this.props;
        const cePutRequest = new FgRestBuilder()
            .url(createUrlForCategoryEditor(ceId))
            .params(() => createParamsForCeEdit({ title }))
            .preLoad(() => this.setState({ pending: true }))
            .postLoad(() => this.setState({ pending: false }))
            .success((response) => {
                try {
                    schema.validate(response, 'categoryEditor');
                    this.props.setCeDetail({
                        ceId,
                        ceDetail: response,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return cePutRequest;
    };

    handleCeClone = (cloneConfirm, ceId, projectId) => {
        if (cloneConfirm) {
            if (this.ceCloneRequest) {
                this.ceCloneRequest.stop();
            }

            this.ceCloneRequest = this.createCeCloneRequest(ceId, projectId);
            this.ceCloneRequest.start();
        }
        this.setState({ cloneConfirmModalShow: false });
    }

    handleCeUse = (useConfirm, ceId, projectId) => {
        if (useConfirm) {
            if (this.projectPatchRequest) {
                this.projectPatchRequest.stop();
            }

            this.projectPatchRequest = this.createProjectPatchRequest(ceId, projectId);
            this.projectPatchRequest.start();
        }
        this.setState({ useConfirmModalShow: false });
    }

    handleCeCloneClick = () => {
        this.setState({ cloneConfirmModalShow: true });
    }

    handleCeUseClick = () => {
        this.setState({ useConfirmModalShow: true });
    }

    // FORM RELATED
    changeCallback = (values, formFieldErrors, formErrors) => {
        this.setState({
            formValues: values,
            formFieldErrors,
            formErrors,
            pristine: true,
        });
    };

    failureCallback = (formFieldErrors, formErrors) => {
        this.setState({
            formFieldErrors,
            formErrors,
            pristine: false,
        });
    };

    handleFormCancel = () => {
        const { ceDetails } = this.props;

        this.setState({
            formValues: { ...ceDetails },
            formErrors: {},
            formFieldErrors: {},
            pristine: false,
            pending: false,
        });
    };

    successCallback = (values) => {
        if (this.cePutRequest) {
            this.cePutRequest.stop();
        }

        this.cePutRequest = this.createCePutRequest(values);
        this.cePutRequest.start();
        this.setState({ pristine: false });
    };

    handleCeEditClick = () => {
        const {
            categoryEditorId,
            mainHistory,
        } = this.props;

        const params = {
            categoryEditorId,
        };

        mainHistory.push(reverseRoute(pathNames.categoryEditor, params));
    }

    renderUseCeButton = () => {
        const {
            categoryEditorId,
            projectDetails,
        } = this.props;

        const { pending } = this.state;
        if (categoryEditorId === projectDetails.categoryEditor) {
            return null;
        }

        return (
            <WarningButton
                iconName={iconNames.check}
                onClick={this.handleCeUseClick}
                disabled={pending}
            >
                {_ts('project', 'useCeButtonLabel')}
            </WarningButton>
        );
    }

    renderEditCeButton = () => {
        const {
            ceDetails,
            categoryEditorId,
        } = this.props;

        if (!ceDetails.isAdmin) {
            return null;
        }
        const params = {
            categoryEditorId,
        };

        const { pending } = this.state;
        const editCeButtonLabel = _ts('project', 'editCeButtonLabel');

        return (
            <Link
                className={styles.editCategoryEditorLink}
                to={reverseRoute(pathNames.categoryEditor, params)}
                disabled={pending}
            >
                { editCeButtonLabel }
            </Link>
        );
    }

    renderHeader = () => {
        const { ceDetails } = this.props;

        const { pending } = this.state;

        const UseCeButton = this.renderUseCeButton;
        const EditCeButton = this.renderEditCeButton;

        return (
            <header className={styles.header}>
                <h2>
                    {ceDetails.title}
                </h2>
                <div className={styles.actionButtons}>
                    <UseCeButton />
                    <EditCeButton />
                    <AccentButton
                        onClick={this.handleCeCloneClick}
                        disabled={pending}
                    >
                        {_ts('project', 'cloneEditCeButtonLabel')}
                    </AccentButton>
                </div>
            </header>
        );
    }

    render() {
        const {
            ceDetails,
            categoryEditorId,
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

        const Header = this.renderHeader;

        return (
            <div className={styles.categoryEditorDetail}>
                { pending && <LoadingAnimation /> }
                <Header />
                <div className={styles.content}>
                    <Form
                        formValues={formValues}
                        formErrors={formErrors}
                        formFieldErrors={formFieldErrors}
                        changeCallback={this.changeCallback}
                        failureCallback={this.failureCallback}
                        handleFormCancel={this.handleFormCancel}
                        successCallback={this.successCallback}
                        className={styles.ceDetailForm}
                        pristine={pristine}
                        pending={pending}
                        readOnly={!ceDetails.isAdmin}
                    />
                </div>
                <Confirm
                    show={useConfirmModalShow}
                    onClose={useConfirm => this.handleCeUse(
                        useConfirm, categoryEditorId, projectDetails.id,
                    )}
                >
                    <p>
                        {_ts('project', 'confirmUseCe', { title: ceDetails.title })}
                    </p>
                    <p>
                        {_ts('project', 'confirmUseCeText')}
                    </p>
                </Confirm>
                {/* FIXME: don't use inline functions */}
                <Confirm
                    show={cloneConfirmModalShow}
                    onClose={cloneConfirm => this.handleCeClone(
                        cloneConfirm, categoryEditorId, projectDetails.id,
                    )}
                >
                    <p>
                        {_ts('project', 'confirmCloneCe', { title: ceDetails.title })}
                    </p>
                    <p>
                        {_ts('project', 'confirmCloneCeText')}
                    </p>
                </Confirm>
            </div>
        );
    }
}
