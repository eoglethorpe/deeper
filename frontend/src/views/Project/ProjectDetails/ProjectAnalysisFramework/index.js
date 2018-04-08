import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../../vendor/react-store/utils/rest';
import { caseInsensitiveSubmatch, compareString } from '../../../../vendor/react-store/utils/common';

import AccentButton from '../../../../vendor/react-store/components/Action/Button/AccentButton';
import SearchInput from '../../../../vendor/react-store/components/Input/SearchInput';
import ListView from '../../../../vendor/react-store/components/View/List/ListView';
import ListItem from '../../../../vendor/react-store/components/View/List/ListItem';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import Modal from '../../../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../../vendor/react-store/components/View/Modal/Body';

import {
    urlForAnalysisFrameworks,
    createParamsForUser,
} from '../../../../rest';
import {
    analysisFrameworkListSelector,
    projectDetailsSelector,

    setAnalysisFrameworksAction,
    projectStringsSelector,
} from '../../../../redux';
import schema from '../../../../schema';
import { iconNames } from '../../../../constants';

import ProjectAfDetail from './ProjectAfDetail';
import AddAnalysisFramework from './AddAnalysisFramework';
import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    analysisFrameworkList: PropTypes.array.isRequired,
    mainHistory: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.number.isRequired,
    setAnalysisFrameworks: PropTypes.func.isRequired,
    projectStrings: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    projectDetails: projectDetailsSelector(state, props),
    analysisFrameworkList: analysisFrameworkListSelector(state),
    projectStrings: projectStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAnalysisFrameworks: params => dispatch(setAnalysisFrameworksAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
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
            showAddAFModal: false,
            displayAfList,
            pending: false,
            searchInputValue: '',
            selectedAf,
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

    handleModalClose = () => {
        this.setState({ showAddAFModal: false });
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
        this.setState({ showAddAFModal: true });
    }

    renderCheckmark = ({ afId }) => {
        const { projectDetails } = this.props;
        if (projectDetails.analysisFramework !== afId) {
            return null;
        }

        const className = [
            iconNames.check,
            styles.check,
        ].join(' ');

        return (
            <span className={className} />
        );
    }

    renderAFListItem = (key, af) => {
        const { selectedAf } = this.state;
        const isActive = af.id === selectedAf;
        const Checkmark = this.renderCheckmark;

        return (
            <ListItem
                active={isActive}
                className={styles.afListItem}
                key={key}
                onClick={() => this.handleAfClick(af.id)}
            >
                {af.title}
                <Checkmark afId={af.id} />
            </ListItem>
        );
    }

    renderSelectedAfDetails = () => {
        const { selectedAf } = this.state;
        const {
            analysisFrameworkList,
            projectStrings,
        } = this.props;

        const noAFText = projectStrings('noAfText');

        if (analysisFrameworkList.length <= 0) {
            return (
                <div className={styles.empty}>
                    { noAFText }
                </div>
            );
        }

        return (
            <ProjectAfDetail
                mainHistory={this.props.mainHistory}
                key={selectedAf}
                analysisFrameworkId={selectedAf}
            />
        );
    }

    renderAnalysisFrameworkList = () => {
        const {
            searchInputValue,
            displayAfList,
        } = this.state;

        const { projectStrings } = this.props;

        const searchAFPlaceholder = projectStrings('searchAfPlaceholder');
        const addAFButtonLabel = projectStrings('addAfButtonLabel');

        const sortedAfs = [...displayAfList];
        sortedAfs.sort((a, b) => compareString(a.title, b.title));

        // FIXME: use strings
        const headingText = 'Analysis frameworks';

        return (
            <div className={styles.afList}>
                <header className={styles.header}>
                    <h4 className={styles.heading}>
                        { headingText }
                    </h4>
                    <AccentButton
                        className={styles.addAfButton}
                        iconName={iconNames.add}
                        onClick={this.handleAddAfButtonClick}
                    >
                        {addAFButtonLabel}
                    </AccentButton>
                    <SearchInput
                        className={styles.searchAfInput}
                        value={searchInputValue}
                        onChange={this.handleSearchInputChange}
                        placeholder={searchAFPlaceholder}
                        showHintAndError={false}
                        showLabel={false}
                    />
                </header>
                <ListView
                    data={sortedAfs}
                    className={styles.content}
                    modifier={this.renderAFListItem}
                />
            </div>
        );
    }

    renderAddAFModal = () => {
        const { showAddAFModal } = this.state;
        const {
            projectId,
            projectStrings,
        } = this.props;

        if (!showAddAFModal) {
            return null;
        }

        const addAFModalTitle = projectStrings('addAfModalTitle');

        return (
            <Modal>
                <ModalHeader title={addAFModalTitle} />
                <ModalBody>
                    <AddAnalysisFramework
                        projectId={projectId}
                        onModalClose={this.handleModalClose}
                    />
                </ModalBody>
            </Modal>
        );
    }

    render() {
        const { pending } = this.state;
        const AFDetails = this.renderSelectedAfDetails;

        const AddAFModal = this.renderAddAFModal;
        const AnalysisFrameworkList = this.renderAnalysisFrameworkList;

        return (
            <div className={styles.projectAnalysisFramework}>
                <AnalysisFrameworkList />
                <div className={styles.detailsContainer}>
                    {pending && <LoadingAnimation />}
                    <AFDetails />
                </div>
                <AddAFModal />
            </div>
        );
    }
}
