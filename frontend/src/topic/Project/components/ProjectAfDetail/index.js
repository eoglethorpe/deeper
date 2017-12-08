import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { RestBuilder } from '../../../../public/utils/rest';
import {
    PrimaryButton,
} from '../../../../public/components/Action';
import {
    createParamsForProjectPatch,
    createUrlForProject,

    createUrlForAfClone,
    createParamsForAfClone,
} from '../../../../common/rest';
import {
    Confirm,
} from '../../../../public/components/View';
import {
    analysisFrameworkDetailSelector,
    tokenSelector,
    projectDetailsSelector,

    setProjectAfAction,
    addNewAfAction,
} from '../../../../common/redux';
import schema from '../../../../common/schema';

import styles from './styles.scss';

const propTypes = {
    afDetails: PropTypes.object.isRequired, // eslint-disable-line
    afId: PropTypes.number,
    addNewAf: PropTypes.func.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line
    setProjectAf: PropTypes.func.isRequired,
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
    dispatch,
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class ProjectAfDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            cloneConfirmModalShow: false,
            useConfirmModalShow: false,
        };
    }

    createProjectPatchRequest = (afId, projectId) => {
        const projectPatchRequest = new RestBuilder()
            .url(createUrlForProject(projectId))
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForProjectPatch(
                    { access },
                    { analysisFramework: afId },
                );
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(10)
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
        const afCloneRequest = new RestBuilder()
            .url(createUrlForAfClone(afId))
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForAfClone(
                    { access },
                    { project: projectId },
                );
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(10)
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

    render() {
        const {
            afDetails,
            afId,
            projectDetails,
        } = this.props;

        const {
            cloneConfirmModalShow,
            useConfirmModalShow,
        } = this.state;

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
                                onClick={this.handleAfUseClick}
                            >
                                Use
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
            </div>
        );
    }
}
