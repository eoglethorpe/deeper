import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import ResizableH from '../../vendor/react-store/components/View/Resizable/ResizableH';
import { isFalsy } from '../../vendor/react-store/utils/common';

import {
    entryStringsSelector,
    aryStringsSelector,
    setAryTemplateAction,
    projectDetailsSelector,
    setProjectAction,
} from '../../redux';

import ProjectRequest from './requests/ProjectRequest';
import AryTemplateRequest from './requests/AryTemplateRequest';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import styles from './styles.scss';

const propTypes = {
    setAryTemplate: PropTypes.func.isRequired,
    activeProject: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    setProject: PropTypes.func.isRequired,
    aryStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    activeProject: {},
};

const mapStateToProps = state => ({
    entryStrings: entryStringsSelector(state),
    aryStrings: aryStringsSelector(state),
    activeProject: projectDetailsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAryTemplate: params => dispatch(setAryTemplateAction(params)),
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
            pending: true,
            noTemplate: false,
        };
    }

    componentWillMount() {
        const { activeProject: { id } } = this.props;
        this.startProjectRequest(id);
    }

    componentWillReceiveProps(nextProps) {
        const { activeProject: { id: oldProjectId } } = this.props;
        const { activeProject: { id: projectId } } = nextProps;
        if (oldProjectId !== projectId) {
            this.startProjectRequest(projectId);
        }
    }

    componentWillUnmount() {
        if (this.aryTemplateRequest) {
            this.aryTemplateRequest.stop();
        }
        if (this.projectRequest) {
            this.projectRequest.stop();
        }
    }

    startProjectRequest = (id) => {
        if (isFalsy(id)) {
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
        this.projectRequest = projectRequest.create(id);
        this.projectRequest.start();
    }

    startAryTemplateRequest = (id) => {
        if (isFalsy(id)) {
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
        this.aryTemplateRequest = aryTemplateRequest.create(id);
        this.aryTemplateRequest.start();
    }

    render() {
        const { aryStrings } = this.props;
        const {
            pending,
            noTemplate,
        } = this.state;

        if (pending) {
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
                leftChild={<LeftPanel />}
                rightChild={<RightPanel />}
            />
        );
    }
}
