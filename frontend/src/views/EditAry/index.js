import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types'; import { connect } from 'react-redux';

import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import ResizableH from '../../vendor/react-store/components/View/Resizable/ResizableH';
import { isFalsy } from '../../vendor/react-store/utils/common';

import {
    setProjectAction,
    setAryTemplateAction,
    setAryAction,

    projectDetailsSelector,
    aryStringsSelector,
    leadIdFromRouteSelector,
} from '../../redux';

import LeadRequest from './requests/LeadRequest';
import ProjectRequest from './requests/ProjectRequest';
import AryTemplateRequest from './requests/AryTemplateRequest';
import AryGetRequest from './requests/AryGetRequest';

import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import styles from './styles.scss';

const propTypes = {
    activeProject: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    activeLeadId: PropTypes.number.isRequired,

    setProject: PropTypes.func.isRequired,
    setAryTemplate: PropTypes.func.isRequired,
    setAry: PropTypes.func.isRequired,

    aryStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    activeProject: {},
};

const mapStateToProps = state => ({
    aryStrings: aryStringsSelector(state),
    activeProject: projectDetailsSelector(state),
    activeLeadId: leadIdFromRouteSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAryTemplate: params => dispatch(setAryTemplateAction(params)),
    setAry: params => dispatch(setAryAction(params)),
    setProject: params => dispatch(setProjectAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class EditAry extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pendingAryTemplate: true,
            pendingLead: true,
            pendingAry: true,

            pending: true,
            noTemplate: false,
        };
    }

    componentWillMount() {
        const { activeProject: { id: projectId }, activeLeadId: leadId } = this.props;
        this.startProjectRequest(projectId);
        this.startAryGetRequest(leadId);
        this.startLeadRequest(leadId);
    }

    componentWillReceiveProps(nextProps) {
        const { activeProject: { id: oldProjectId }, activeLeadId: oldLeadId } = this.props;
        const { activeProject: { id: projectId }, activeLeadId: leadId } = nextProps;
        if (oldProjectId !== projectId) {
            this.startProjectRequest(projectId);
        }
        if (oldLeadId !== leadId) {
            this.startAryGetRequest(leadId);
            this.startLeadRequest(leadId);
        }
    }

    componentWillUnmount() {
        if (this.aryTemplateRequest) {
            this.aryTemplateRequest.stop();
        }
        if (this.projectRequest) {
            this.projectRequest.stop();
        }
        if (this.aryGetRequest) {
            this.aryGetRequest.stop();
        }
        if (this.leadRequest) {
            this.leadRequest.stop();
        }
    }

    startLeadRequest = (leadId) => {
        if (this.leadRequest) {
            this.leadRequest.stop();
        }
        const leadRequest = new LeadRequest(this);
        this.leadRequest = leadRequest.create(leadId);
        this.leadRequest.start();
    }

    startAryGetRequest = (leadId) => {
        const { setAry } = this.props;
        if (this.aryGetRequest) {
            this.aryGetRequest.stop();
        }
        const aryGetRequest = new AryGetRequest(
            this,
            { setAry },
        );

        this.aryGetRequest = aryGetRequest.create(leadId);
        this.aryGetRequest.start();
    }

    startProjectRequest = (projectId) => {
        if (isFalsy(projectId)) {
            return;
        }
        // stop all the request [both project update and aryTemplate]
        if (this.aryTemplateRequest) {
            this.aryTemplateRequest.stop();
        }
        if (this.projectRequest) {
            this.projectRequest.stop();
        }

        const projectRequest = new ProjectRequest(
            this,
            {
                startAryTemplateRequest: this.startAryTemplateRequest,
                setProject: this.props.setProject,
            },
        );
        this.projectRequest = projectRequest.create(projectId);
        this.projectRequest.start();
    }

    startAryTemplateRequest = (aryTemplateId) => {
        if (isFalsy(aryTemplateId)) {
            return;
        }
        // only stop previous ary template request
        if (this.aryTemplateRequest) {
            this.aryTemplateRequest.stop();
        }

        const aryTemplateRequest = new AryTemplateRequest(
            this,
            { setAryTemplate: this.props.setAryTemplate },
        );
        this.aryTemplateRequest = aryTemplateRequest.create(aryTemplateId);
        this.aryTemplateRequest.start();
    }

    render() {
        const { aryStrings } = this.props;
        const {
            pendingEntries,
            pendingLead,
            pendingAryTemplate,
            noTemplate,
            lead,
        } = this.state;

        if (pendingEntries || pendingLead || pendingAryTemplate) {
            return <LoadingAnimation />;
        }

        if (noTemplate) {
            return (
                <div styleName="no-ary-template">
                    <p>{aryStrings('noAryTemplateForProject')}</p>
                </div>
            );
        }

        return (
            <ResizableH
                styleName="ary"
                leftContainerClassName={styles.left}
                rightContainerClassName={styles.right}
                leftChild={
                    <LeftPanel
                        lead={lead}
                    />
                }
                rightChild={<RightPanel />}
            />
        );
    }
}
