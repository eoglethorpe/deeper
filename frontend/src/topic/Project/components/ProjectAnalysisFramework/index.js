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
import { caseInsensitiveSubmatch } from '../../../../public/utils/common';

import schema from '../../../../common/schema';
import {
    urlForAnalysisFrameworks,
    createParamsForUser,
} from '../../../../common/rest';
import {
    analysisFrameworkListSelector,
    projectDetailsSelector,

    setAnalysisFrameworksAction,
} from '../../../../common/redux';

import {
    iconNames,
} from '../../../../common/constants';

import ProjectAfDetail from '../ProjectAfDetail';
import AddAnalysisFramework from '../AddAnalysisFramework';
import styles from './styles.scss';

const propTypes = {
    projectId: PropTypes.number.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setAnalysisFrameworks: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    analysisFrameworkList: PropTypes.array.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    projectDetails: projectDetailsSelector(state, props),
    analysisFrameworkList: analysisFrameworkListSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAnalysisFrameworks: params => dispatch(setAnalysisFrameworksAction(params)),
});

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

            // why filter again?
            const { searchInputValue } = this.state;
            const displayAfList = analysisFrameworkList.filter(
                af => caseInsensitiveSubmatch(af.title, searchInputValue),
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

    createAfsRequest = () => {
        const afsRequest = new FgRestBuilder()
            .url(urlForAnalysisFrameworks)
            .params(() => createParamsForUser())
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

    handleSearchInputChange = (searchInputValue) => {
        const { analysisFrameworkList } = this.props;
        const displayAfList = analysisFrameworkList.filter(
            af => caseInsensitiveSubmatch(af.title, searchInputValue),
        );

        this.setState({
            displayAfList,
            searchInputValue,
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

    renderSelectedAfDetails = () => {
        const { selectedAf } = this.state;
        const { analysisFrameworkList } = this.props;

        if (analysisFrameworkList.length <= 0) {
            return (
                <h1 styleName="no-analysis-framework">
                    There are no analysis frameworks.
                </h1>
            );
        }

        return (
            <ProjectAfDetail
                key={selectedAf}
                afId={selectedAf}
            />
        );
    }


    render() {
        const {
            displayAfList,
            pending,
            searchInputValue,
        } = this.state;

        const {
            projectId,
        } = this.props;

        const sortedAfs = [...displayAfList];
        sortedAfs.sort((a, b) => (a.title.localeCompare(b.title)));

        return (
            <div styleName="project-analysis-framework">
                <div styleName="list-container">
                    <div styleName="list-header">
                        <TextInput
                            styleName="search-input"
                            value={searchInputValue}
                            onChange={this.handleSearchInputChange}
                            placeholder="Search Analysis Framework"
                            type="search"
                        />
                        <PrimaryButton
                            styleName="add-btn"
                            iconName={iconNames.add}
                            onClick={this.handleAddAfButtonClick}
                        >
                            Add
                        </PrimaryButton>
                        <Modal
                            closeOnEscape
                            onClose={this.handleModalClose}
                            show={this.state.addAfModalShow}
                            closeOnBlur
                        >
                            <ModalHeader title="Add new analysis framework" />
                            <ModalBody>
                                <AddAnalysisFramework
                                    projectId={projectId}
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
                    {this.renderSelectedAfDetails()}
                </div>
            </div>
        );
    }
}

