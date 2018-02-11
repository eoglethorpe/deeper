import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../../public/utils/rest';
import { caseInsensitiveSubmatch, compareString } from '../../../../public/utils/common';
import PrimaryButton from '../../../../public/components/Action/Button/PrimaryButton';
import TextInput from '../../../../public/components/Input/TextInput';
import ListView from '../../../../public/components/View/List/ListView';
import ListItem from '../../../../public/components/View/List/ListItem';
import LoadingAnimation from '../../../../public/components/View/LoadingAnimation';
import Modal from '../../../../public/components/View/Modal';
import ModalHeader from '../../../../public/components/View/Modal/Header';
import ModalBody from '../../../../public/components/View/Modal/Body';

import {
    urlForCategoryEditors,
    createParamsForUser,
} from '../../../../common/rest';
import {
    categoryEditorListSelector,
    projectDetailsSelector,

    setCategoryEditorsAction,
    projectStringsSelector,
} from '../../../../common/redux';
import schema from '../../../../common/schema';
import { iconNames } from '../../../../common/constants';

import ProjectCeDetail from '../ProjectCeDetail';
import AddCategoryEditor from '../AddCategoryEditor';
import styles from './styles.scss';

const propTypes = {
    categoryEditorList: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    mainHistory: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
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
@CSSModules(styles, { allowMultiple: true })
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

    renderCeList = (key, ce) => {
        const { projectDetails } = this.props;
        const isActive = ce.id === this.state.selectedCe;
        const isProjectCe = projectDetails.categoryEditor === ce.id;
        return (
            <ListItem
                active={isActive}
                key={key}
                scrollIntoView={isActive}
            >
                <button
                    className="button"
                    onClick={() => this.handleCeClick(ce.id)}
                >
                    {ce.title}
                    {isProjectCe && <span className={`${iconNames.check} check`} />}
                </button>
            </ListItem>
        );
    }

    renderSelectedCeDetails = () => {
        const { selectedCe } = this.state;
        const { categoryEditorList } = this.props;

        if (categoryEditorList.length <= 0) {
            return (
                <h1 styleName="no-category-editor">
                    {this.props.projectStrings('noCeText')}
                </h1>
            );
        }

        return (
            <ProjectCeDetail
                mainHistory={this.props.mainHistory}
                key={selectedCe}
                categoryEditorId={selectedCe}
            />
        );
    }


    render() {
        const {
            displayCeList,
            pending,
            searchInputValue,
        } = this.state;

        const {
            projectId,
        } = this.props;

        const sortedCes = [...displayCeList];
        sortedCes.sort((a, b) => compareString(a.title, b.title));

        return (
            <div styleName="project-category-editor">
                <div styleName="list-container">
                    <div styleName="list-header">
                        <TextInput
                            styleName="search-input"
                            value={searchInputValue}
                            onChange={this.handleSearchInputChange}
                            placeholder={this.props.projectStrings('searchCePlaceholder')}
                            type="search"
                        />
                        <PrimaryButton
                            styleName="add-btn"
                            iconName={iconNames.add}
                            onClick={this.handleAddCeButtonClick}
                        >
                            {this.props.projectStrings('addCeButtonLabel')}
                        </PrimaryButton>
                        { this.state.addCeModalShow &&
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
                        }
                    </div>
                    <ListView
                        styleName="list"
                        modifier={this.renderCeList}
                        data={sortedCes}
                        keyExtractor={this.calcCeKey}
                    />
                </div>
                <div styleName="details-container">
                    {pending && <LoadingAnimation />}
                    {this.renderSelectedCeDetails()}
                </div>
            </div>
        );
    }
}
