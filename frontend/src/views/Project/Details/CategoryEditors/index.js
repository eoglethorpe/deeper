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
    urlForCategoryEditors,
    createParamsForUser,
} from '../../../../rest';
import {
    categoryEditorListSelector,
    projectDetailsSelector,

    setCategoryEditorsAction,
    projectStringsSelector,
} from '../../../../redux';
import schema from '../../../../schema';
import { iconNames } from '../../../../constants';

import Details from './Details';
import AddCategoryEditor from './AddCategoryEditor';
import styles from './styles.scss';

const propTypes = {
    categoryEditorList: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.number.isRequired,
    setCategoryEditors: PropTypes.func.isRequired,
    projectStrings: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    projectDetails: projectDetailsSelector(state, props),
    categoryEditorList: categoryEditorListSelector(state),
    projectStrings: projectStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setCategoryEditors: params => dispatch(setCategoryEditorsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectCategoryEditor extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        const {
            categoryEditorList,
            projectDetails,
        } = props;

        const displayCeList = [...categoryEditorList];

        let selectedCe;
        if (projectDetails.categoryEditor) {
            // if there is categoryEditor in current project
            selectedCe = projectDetails.categoryEditor;
        } else {
            // if not, get first
            selectedCe = displayCeList.length > 0 ? displayCeList[0].id : 0;
        }

        this.state = {
            addCeModalShow: false,
            displayCeList,
            pending: false,
            searchInputValue: '',
            selectedCe,
        };
    }

    componentWillMount() {
        if (this.cesRequest) {
            this.cesRequest.stop();
        }
        this.cesRequest = this.createCesRequest();
        this.cesRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps !== this.props) {
            const {
                categoryEditorList,
                projectDetails,
            } = nextProps;

            // why filter again?
            const { searchInputValue } = this.state;
            const displayCeList = categoryEditorList.filter(
                ce => caseInsensitiveSubmatch(ce.title, searchInputValue),
            );

            let selectedCe;
            if (projectDetails.categoryEditor) {
                // if there is category editor in current project
                selectedCe = projectDetails.categoryEditor;
            } else {
                // if not, get first
                selectedCe = displayCeList.length > 0 ? displayCeList[0].id : 0;
            }

            this.setState({
                selectedCe,
                displayCeList,
            });
        }
    }

    componentWillUnmount() {
        if (this.cesRequest) {
            this.cesRequest.stop();
        }
    }

    createCesRequest = () => {
        const cesRequest = new FgRestBuilder()
            .url(urlForCategoryEditors)
            .params(() => createParamsForUser())
            .preLoad(() => this.setState({ pending: true }))
            .postLoad(() => this.setState({ pending: false }))
            .success((response) => {
                try {
                    schema.validate(response, 'categoryEditorList');
                    this.props.setCategoryEditors({
                        categoryEditors: response.results,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return cesRequest;
    };

    handleCeClick = (ceId) => {
        this.setState({ selectedCe: ceId });
    }

    handleSearchInputChange = (searchInputValue) => {
        const { categoryEditorList } = this.props;
        const displayCeList = categoryEditorList.filter(
            ce => caseInsensitiveSubmatch(ce.title, searchInputValue),
        );

        this.setState({
            displayCeList,
            searchInputValue,
        });
    };

    handleAddCeButtonClick = () => {
        this.setState({ addCeModalShow: true });
    }

    handleModalClose = () => {
        this.setState({ addCeModalShow: false });
    }

    calcCeKey = ce => ce.id;

    renderCheckmark = ({ ceId }) => {
        const { projectDetails } = this.props;
        if (projectDetails.categoryEditor !== ceId) {
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

    renderCeList = (key, ce) => {
        const { selectedCe } = this.state;
        const isActive = ce.id === selectedCe;
        const Checkmark = this.renderCheckmark;

        return (
            <ListItem
                active={isActive}
                key={key}
                onClick={() => this.handleCeClick(ce.id)}
                className={styles.ceListItem}
            >
                {ce.title}
                <Checkmark ceId={ce.id} />
            </ListItem>
        );
    }

    renderCategoryEditorList = () => {
        const {
            displayCeList,
            searchInputValue,
        } = this.state;

        const sortedCes = [...displayCeList];
        sortedCes.sort((a, b) => compareString(a.title, b.title));

        // FIXME: use strings
        const headingText = 'Category Editors';

        return (
            <div className={styles.ceList}>
                <div className={styles.header}>
                    <h4 className={styles.heading}>
                        { headingText }
                    </h4>
                    <AccentButton
                        className={styles.addCeButton}
                        iconName={iconNames.add}
                        onClick={this.handleAddCeButtonClick}
                    >
                        {this.props.projectStrings('addCeButtonLabel')}
                    </AccentButton>
                    <SearchInput
                        className={styles.searchCeInput}
                        value={searchInputValue}
                        onChange={this.handleSearchInputChange}
                        placeholder={this.props.projectStrings('searchCePlaceholder')}
                        showHintAndError={false}
                        showLabel={false}
                    />
                </div>
                <ListView
                    className={styles.content}
                    modifier={this.renderCeList}
                    data={sortedCes}
                    keyExtractor={this.calcCeKey}
                />
            </div>
        );
    }

    renderSelectedCeDetails = () => {
        const { selectedCe } = this.state;
        const { categoryEditorList } = this.props;

        if (categoryEditorList.length <= 0) {
            return (
                <div className={styles.empty}>
                    {this.props.projectStrings('noCeText')}
                </div>
            );
        }

        return <Details categoryEditorId={selectedCe} />;
    }

    renderAddCeModal = () => {
        const { addCeModalShow } = this.state;

        const {
            projectId,
        } = this.props;

        if (!addCeModalShow) {
            return null;
        }

        return (
            <Modal
                closeOnEscape
                onClose={this.handleModalClose}
                closeOnBlur
            >
                <ModalHeader title={this.props.projectStrings('addCeModalTitle')} />
                <ModalBody>
                    <AddCategoryEditor
                        projectId={projectId}
                        onModalClose={this.handleModalClose}
                    />
                </ModalBody>
            </Modal>
        );
    }

    render() {
        const { pending } = this.state;
        const CeDetails = this.renderSelectedCeDetails;

        const CategoryEditorList = this.renderCategoryEditorList;
        const AddCeModal = this.renderAddCeModal;

        return (
            <div className={styles.projectCategoryEditor}>
                <CategoryEditorList />
                <div className={styles.detailsContainer}>
                    {pending && <LoadingAnimation large />}
                    <CeDetails />
                </div>
                <AddCeModal />
            </div>
        );
    }
}
