import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    FgRestBuilder,
} from '../../vendor/react-store/utils/rest';
import { isFalsy } from '../../vendor/react-store/utils/common';
import schema from '../../schema';
import {
    entryStringsSelector,
    afStringsSelector,
    setAryTemplateAction,
    projectDetailsSelector,
    setProjectAction,
} from '../../redux';
import {
    createUrlForAryTemplate,
    commonParamsForGET,
    createUrlForProject,
    createParamsForUser,
} from '../../rest';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import ResizableH from '../../vendor/react-store/components/View/Resizable/ResizableH';

import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';

import styles from './styles.scss';

const propTypes = {
    setAryTemplate: PropTypes.func.isRequired,
    activeProject: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    setProject: PropTypes.func.isRequired,
    afStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    activeProject: {},
};

const mapStateToProps = state => ({
    entryStrings: entryStringsSelector(state),
    afStrings: afStringsSelector(state),
    activeProject: projectDetailsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAryTemplate: params => dispatch(setAryTemplateAction(params)),
    setProject: params => dispatch(setProjectAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Ary extends React.PureComponent {
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
        this.updateProject(id);
    }

    componentWillReceiveProps(nextProps) {
        const { activeProject: { id: oldProjectId } } = this.props;
        const { activeProject: { id: projectId } } = nextProps;
        if (oldProjectId !== projectId) {
            this.updateProject(projectId);
        }
    }

    componentWillUnmount() {
        this.stopRequests();
    }

    updateProject = (id) => {
        if (id) {
            // stop all the request [both project update and aryTemplate]
            this.stopRequests();
            this.projectRequest = this.createRequestForProject(id);
            this.projectRequest.start();
        }
    }

    updateAryTemplate = (id) => {
        if (id) {
            // only stop previous ary template request
            this.stopRequests({ project: false });
            this.aryTemplateRequest = this.createRequestForAryTemplate(id);
            this.aryTemplateRequest.start();
        }
    }

    stopRequests = ({ project = true, aryTemplate = true } = {}) => {
        if (project && this.projectRequest) {
            this.projectRequest.stop();
        }
        if (aryTemplate && this.aryTemplateRequest) {
            this.aryTemplateRequest.stop();
        }
    }

    createRequestForProject = (projectId) => {
        const projectRequest = new FgRestBuilder()
            .url(createUrlForProject(projectId))
            .params(() => createParamsForUser())
            .preLoad(() => { this.setState({ pending: true, noTemplate: false }); })
            .success((response) => {
                try {
                    schema.validate(response, 'projectGetResponse');
                    this.props.setProject({ project: response });
                    if (isFalsy(response.assessmentTemplate)) {
                        console.warn('There is no assessment template');
                        this.setState({ noTemplate: true, pending: false });
                    } else {
                        this.updateAryTemplate(response.assessmentTemplate);
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

    createRequestForAryTemplate = (id) => {
        const aryTemplateRequest = new FgRestBuilder()
            .url(createUrlForAryTemplate(id))
            .params(commonParamsForGET())
            .preLoad(() => { this.setState({ pending: true }); })
            .postLoad(() => { this.setState({ pending: false }); })
            .success((response) => {
                try {
                    schema.validate(response, 'aryTemplateGetResponse');
                    this.props.setAryTemplate({ template: response });
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
            })
            .fatal((response) => {
                console.info('FATAL:', response);
            })
            .build();
        return aryTemplateRequest;
    }

    render() {
        const { afStrings } = this.props;
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
                    <p>{afStrings('noAryTemplateForProject')}</p>
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
