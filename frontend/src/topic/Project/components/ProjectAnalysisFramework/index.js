import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    PrimaryButton,
} from '../../../../public/components/Action';
import {
    TextInput,
} from '../../../../public/components/Input';
import {
    ListItem,
    ListView,
    LoadingAnimation,
    Modal,
    ModalHeader,
    ModalBody,
} from '../../../../public/components/View';
import { FgRestBuilder } from '../../../../public/utils/rest';

import schema from '../../../../common/schema';
import {
    urlForAnalysisFrameworks,
    createParamsForUser,
} from '../../../../common/rest';
import {
    activeProjectSelector,
    analysisFrameworkListSelector,
    projectDetailsSelector,

    tokenSelector,

    setAnalysisFrameworksAction,
} from '../../../../common/redux';

import {
    iconNames,
} from '../../../../common/constants';

import ProjectAfDetail from '../ProjectAfDetail';
import AddAnalysisFramework from '../AddAnalysisFramework';
import styles from './styles.scss';

const propTypes = {
    activeProject: PropTypes.number,
    token: PropTypes.object.isRequired, // eslint-disable-line
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line
    setAnalysisFrameworks: PropTypes.func.isRequired,
    analysisFrameworkList: PropTypes.array.isRequired, // eslint-disable-line
};

const defaultProps = {
    activeProject: undefined,
};

const mapStateToProps = (state, props) => ({
    token: tokenSelector(state),
    activeProject: activeProjectSelector(state, props),
    projectDetails: projectDetailsSelector(state, props),
    analysisFrameworkList: analysisFrameworkListSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAnalysisFrameworks: params => dispatch(setAnalysisFrameworksAction(params)),
});

const emptyList = [];

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class ProjectAnalysisFramework extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        const {
            analysisFrameworkList,
            projectDetails,
        } = props;

        const displayAfList = [...analysisFrameworkList];

        let selectedAf;
        if (projectDetails.analysisFramework) {
            // if there is analysisFramework in current project
            selectedAf = projectDetails.analysisFramework;
        } else {
            // if not, get first
            selectedAf = displayAfList.length > 0 ? displayAfList[0].id : 0;
        }

        this.state = {
            selectedAf,
            pending: false,
            addAfModalShow: false,
            searchInputValue: '',
            displayAfList,
        };
    }

    componentWillMount() {
        if (this.afsRequest) {
            this.afsRequest.stop();
        }
        this.afsRequest = this.createAfsRequest();
        this.afsRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps !== this.props) {
            const {
                analysisFrameworkList,
                projectDetails,
            } = nextProps;

            // why fitler again?
            const { searchInputValue } = this.state;
            const displayAfList = analysisFrameworkList.filter(
                this.caseInsensitiveSubmatch(searchInputValue),
            );

            let selectedAf;
            if (projectDetails.analysisFramework) {
                // if there is analysisFramework in current project
                selectedAf = projectDetails.analysisFramework;
            } else {
                // if not, get first
                selectedAf = displayAfList.length > 0 ? displayAfList[0].id : 0;
            }

            this.setState({
                selectedAf,
                displayAfList,
            });
        }
    }

    componentWillUnmount() {
        if (this.afsRequest) {
            this.afsRequest.stop();
        }
    }

    caseInsensitiveSubmatch = searchInputValue => (analysisFramework) => {
        if (analysisFramework.title) {
            const afTitle = analysisFramework.title.toLowerCase();
            const searchTitle = searchInputValue.toLowerCase();
            return afTitle.includes(searchTitle);
        }
        return null;
    };

    createAfsRequest = () => {
        const afsRequest = new FgRestBuilder()
            .url(urlForAnalysisFrameworks)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUser({
                    access,
                });
            })
            .preLoad(() => this.setState({ pending: true }))
            .postLoad(() => this.setState({ pending: false }))
            .success((response) => {
                try {
                    schema.validate(response, 'analysisFrameworkList');
                    this.props.setAnalysisFrameworks({
                        analysisFrameworks: response.results,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return afsRequest;
    };
    handleAfClick = (afId) => {
        this.setState({ selectedAf: afId });
    }

    handleSearchInputChange = (value) => {
        const { analysisFrameworkList } = this.props;

        const caseInsensitiveSubmatch = af => (
            af.title.toLowerCase().includes(value.toLowerCase())
        );
        const displayAfList = (analysisFrameworkList || emptyList)
            .filter(caseInsensitiveSubmatch);

        this.setState({
            displayAfList,
            searchInputValue: value,
        });
    };

    handleAddAfButtonClick = () => {
        this.setState({ addAfModalShow: true });
    }

    handleModalClose = () => {
        this.setState({ addAfModalShow: false });
    }

    calcAfKey = af => af.id;

    renderAfList = (key, af) => {
        const { projectDetails } = this.props;
        const isActive = af.id === this.state.selectedAf;
        const isProjectAf = projectDetails.analysisFramework === af.id;
        return (
            <ListItem
                active={isActive}
                key={key}
                scrollIntoView={isActive}
            >
                <button
                    className="button"
                    onClick={() => this.handleAfClick(af.id)}
                >
                    {af.title}
                    {isProjectAf && <span className={`${iconNames.check} check`} />}
                </button>
            </ListItem>
        );
    }

    renderSelectedAfDetails = (selectedAf) => {
        const { displayAfList } = this.state;

        if ((displayAfList || emptyList).length > 0) {
            return (
                <ProjectAfDetail
                    key={selectedAf}
                    afId={selectedAf}
                />
            );
        }

        return (
            <h1 styleName="no-analysis-framework">
                There are no analysis frameworks.
            </h1>
        );
    }


    render() {
        const {
            selectedAf,
            displayAfList,
            pending,
            searchInputValue,
        } = this.state;

        const {
            activeProject,
        } = this.props;

        const sortedAfs = [...displayAfList];
        sortedAfs.sort((a, b) => (a.title.localeCompare(b.title)));

        return (
            <div styleName="project-analysis-framework">
                <div styleName="list-container">
                    <div styleName="list-header">
                        <h2>
                            Analysis Framworks
                        </h2>
                        <PrimaryButton
                            iconName={iconNames.add}
                            onClick={this.handleAddAfButtonClick}
                        >
                            Add
                        </PrimaryButton>
                        <TextInput
                            styleName="search-input"
                            value={searchInputValue}
                            onChange={this.handleSearchInputChange}
                            placeholder="Search Analysis Frameworks"
                            type="search"
                        />
                        <Modal
                            closeOnEscape
                            onClose={this.handleModalClose}
                            show={this.state.addAfModalShow}
                            closeOnBlur
                        >
                            <ModalHeader title="Add new analysis framework" />
                            <ModalBody>
                                <AddAnalysisFramework
                                    projectId={activeProject}
                                    onModalClose={this.handleModalClose}
                                />
                            </ModalBody>
                        </Modal>
                    </div>
                    <ListView
                        styleName="list"
                        modifier={this.renderAfList}
                        data={sortedAfs}
                        keyExtractor={this.calcAfKey}
                    />
                </div>
                <div styleName="details-container">
                    {pending && <LoadingAnimation />}
                    {this.renderSelectedAfDetails(selectedAf)}
                </div>
            </div>
        );
    }
}

