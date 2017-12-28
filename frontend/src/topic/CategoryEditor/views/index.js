import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    TextInput,
    SelectInput,
} from '../../../public/components/Input';
import {
    Button,
    PrimaryButton,
    DangerButton,
    SuccessButton,
} from '../../../public/components/Action';
import {
    LoadingAnimation,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '../../../public/components/View';
import { FgRestBuilder } from '../../../public/utils/rest';
import {
    isTruthy,
    isFalsy,
    randomString,
} from '../../../public/utils/common';

import DocumentPanel from './DocumentPanel';
import SubcategoryColumn from './SubcategoryColumn';
import SubcategoryPropertyPanel from './SubcategoryPropertyPanel';

import {
    categoryEditorViewTitleSelector,
    categoryEditorViewVersionIdSelector,
    categoryEditorViewPristineSelector,
    categoriesSelector,
    activeCategoryIdSelector,
    addNewCategoryAction,
    setActiveCategoryIdAction,
    addNewSubcategoryAction,
    updateSelectedSubcategoriesAction,
    addSubcategoryNGramAction,
    addManualSubcategoryNGramAction,
    setCategoryEditorAction,
} from '../../../common/redux';
import {
    createUrlForCategoryEditor,
    createParamsForUser,
    createParamsForCeViewPatch,
} from '../../../common/rest';
import schema from '../../../common/schema';
import notify from '../../../common/notify';

import styles from './styles.scss';

const mapStateToProps = (state, props) => ({
    categoryEditorViewTitle: categoryEditorViewTitleSelector(state, props),
    categoryEditorViewVersionId: categoryEditorViewVersionIdSelector(state, props),
    categoryEditorViewPristine: categoryEditorViewPristineSelector(state, props),

    categories: categoriesSelector(state, props),
    activeCategoryId: activeCategoryIdSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    addNewCategory: params => dispatch(addNewCategoryAction(params)),
    setActiveCategoryId: params => dispatch(setActiveCategoryIdAction(params)),
    addNewSubcategory: params => dispatch(addNewSubcategoryAction(params)),
    updateSelectedSubcategories: params => dispatch(updateSelectedSubcategoriesAction(params)),
    addSubcategoryNGram: params => dispatch(addSubcategoryNGramAction(params)),
    addManualSubcategoryNGram: params => dispatch(addManualSubcategoryNGramAction(params)),
    setCategoryEditor: params => dispatch(setCategoryEditorAction(params)),
});

const propTypes = {
    categoryEditorViewTitle: PropTypes.string.isRequired,
    categoryEditorViewVersionId: PropTypes.number,
    categoryEditorViewPristine: PropTypes.bool,

    categories: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    activeCategoryId: PropTypes.string,
    addNewCategory: PropTypes.func.isRequired,
    setActiveCategoryId: PropTypes.func.isRequired,
    addNewSubcategory: PropTypes.func.isRequired,
    updateSelectedSubcategories: PropTypes.func.isRequired,
    addSubcategoryNGram: PropTypes.func.isRequired,
    addManualSubcategoryNGram: PropTypes.func.isRequired,
    setCategoryEditor: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    activeCategoryId: undefined,
    categoryEditorViewVersionId: undefined,
    categoryEditorViewPristine: undefined,
};

const LIMIT = 5;

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class CategoryEditor extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pending: true,

            showCategoryTitleModal: false,
            newCategoryTitleInputValue: '',

            showSubcategoryTitleModal: false,
            newSubcategoryTitleInputValue: '',

            showNewManualNGramModal: false,
            newManualNGramInputValue: '',
        };
    }

    componentWillMount() {
        const { match } = this.props;
        this.ceRequest = this.createCeRequest(match.params.categoryEditorId);
        this.ceRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { match: oldMatch } = this.props;
        const { match: newMatch } = nextProps;
        if (oldMatch !== newMatch &&
            (oldMatch.params.categoryEditorId !== newMatch.params.categoryEditorId)
        ) {
            this.ceRequest.stop();
            this.ceRequest = this.createCeRequest(newMatch.params.categoryEditorId);
            this.ceRequest.start();
        }
    }

    componentWillUnmount() {
        this.ceRequest.stop();
    }

    createCeSaveRequest = ({ categoryEditorId, categoryEditor }) => {
        const cesRequest = new FgRestBuilder()
            .url(createUrlForCategoryEditor(categoryEditorId))
            .params(() => createParamsForCeViewPatch({ data: categoryEditor }))
            .preLoad(() => this.setState({ pending: true }))
            .postLoad(() => this.setState({ pending: false }))
            .success((response) => {
                try {
                    schema.validate(response, 'categoryEditor');
                    this.props.setCategoryEditor({
                        categoryEditor: response,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return cesRequest;
    };

    createCeRequest = (categoryEditorId) => {
        const cesRequest = new FgRestBuilder()
            .url(createUrlForCategoryEditor(categoryEditorId))
            .params(() => createParamsForUser())
            .preLoad(() => this.setState({ pending: true }))
            .postLoad(() => this.setState({ pending: false }))
            .success((response) => {
                try {
                    schema.validate(response, 'categoryEditor');

                    const {
                        categoryEditorViewVersionId,
                    } = this.props;
                    if (isFalsy(categoryEditorViewVersionId)) {
                        this.props.setCategoryEditor({ categoryEditor: response });
                    } else if (categoryEditorViewVersionId < response.versionId) {
                        notify.send({
                            type: notify.type.WARNING,
                            title: 'Category editor was updated in server.',
                            message: 'Your copy was overridden by server\'s copy',
                            duration: notify.duration.SLOW,
                        });
                        this.props.setCategoryEditor({ categoryEditor: response });
                    }
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return cesRequest;
    };

    handleCategoryEditorSaveButtonClick = () => {
        if (this.saveCeRequest) {
            this.saveCeRequest.stop();
        }

        const { activeCategoryId, categories } = this.props;
        this.saveCeRequest = this.createCeSaveRequest({
            categoryEditorId: this.props.match.params.categoryEditorId,
            categoryEditor: {
                activeCategoryId,
                categories,
            },
        });

        this.saveCeRequest.start();
    }

    handleSubcategoryDrop = (level, subcategoryId, data) => {
        const { addSubcategoryNGram } = this.props;
        try {
            const ngram = JSON.parse(data);
            addSubcategoryNGram({
                categoryEditorId: this.props.match.params.categoryEditorId,
                level,
                subcategoryId,
                ngram,
            });
        } catch (ex) {
            notify.send({
                type: notify.type.WARNING,
                title: 'Invalid drop source',
                message: 'Only drop from Extracted Words are valid.',
            });
            console.warn('Drop element is not valid');
        }
    }

    handleNewSubcategory = (level) => {
        this.newSubcategoryLevel = level;
        this.setState({ showSubcategoryTitleModal: true });
    }

    handleSubcategoryClick = (level, subcategoryId) => {
        const { updateSelectedSubcategories } = this.props;
        updateSelectedSubcategories({
            categoryEditorId: this.props.match.params.categoryEditorId,
            level,
            subcategoryId,
        });
    }

    addNewSubcategory = (title) => {
        const { newSubcategoryLevel: level } = this;
        const { addNewSubcategory } = this.props;
        const id = randomString();
        addNewSubcategory({
            categoryEditorId: this.props.match.params.categoryEditorId,
            level,
            id,
            title,
        });
    }

    addNewCategory = (title) => {
        const key = randomString();
        const newCategory = {
            categoryEditorId: this.props.match.params.categoryEditorId,
            id: key,
            title,
        };
        this.props.addNewCategory(newCategory);
    }

    handleCategorySelectChange = (value) => {
        const { setActiveCategoryId } = this.props;
        setActiveCategoryId({
            categoryEditorId: this.props.match.params.categoryEditorId,
            id: value,
        });
    }

    handleAddCategoryButtonClick = () => {
        this.setState({ showCategoryTitleModal: true });
    }

    handlePropertyAddSubcategoryButtonClick = () => {
        this.addNewSubcategoryInActiveSubcategory();
    }

    handleModalClose = () => {
        this.setState({
            showCategoryTitleModal: false,
            showSubategoryTitleModal: false,
            showNewManualNGramModal: false,
        });
    }

    handleModalCancelButtonClick = () => {
        this.setState({
            showCategoryTitleModal: false,
            showSubcategoryTitleModal: false,
            showNewManualNGramModal: false,
            newCategoryTitleInputValue: '',
            newSubcategoryTitleInputValue: '',
            newManualNGramInputValue: '',
        });
    }

    handleNewCategoryTitleInputValueChange = (value) => {
        this.setState({ newCategoryTitleInputValue: value });
    }

    handleCategoryTitleModalOkButtonClick = () => {
        this.addNewCategory(this.state.newCategoryTitleInputValue);

        this.setState({
            showCategoryTitleModal: false,
            newCategoryTitleInputValue: '',
        });
    }

    handleNewSubcategoryTitleInputValueChange = (value) => {
        this.setState({ newSubcategoryTitleInputValue: value });
    }

    handleSubcategoryTitleModalOkButtonClick = () => {
        this.addNewSubcategory(this.state.newSubcategoryTitleInputValue);

        this.setState({
            showSubcategoryTitleModal: false,
            newSubcategoryTitleInputValue: '',
        });
    }

    handleNewManualNGramInputValueChange = (value) => {
        this.setState({ newManualNGramInputValue: value });
    }

    handleNewManualNGramModalOkButtonClick = () => {
        this.props.addManualSubcategoryNGram({
            categoryEditorId: this.props.match.params.categoryEditorId,
            ngram: {
                n: this.state.newManualNGramInputValue.split(' ').length,
                keyword: this.state.newManualNGramInputValue,
            },
        });
        this.setState({
            showNewManualNGramModal: false,
            newManualNGramInputValue: '',
        });
    }

    handleNewManualNGram = () => {
        this.setState({
            showNewManualNGramModal: true,
        });
    };

    renderSubcategoryColumns = () => {
        const {
            categories,
            activeCategoryId,
        } = this.props;

        const category = categories.find(d => d.id === activeCategoryId);
        const { selectedSubcategories } = category;

        let nextSubcategory = category;
        const subcategoryColumns = selectedSubcategories.map((selected, i) => {
            const isLastColumn = i === selectedSubcategories.length - 1;

            const subcategoryIndex = nextSubcategory.subcategories.findIndex(
                d => d.id === selected,
            );
            const currentSubcategories = nextSubcategory.subcategories;
            const currentSubcategoryTitle = nextSubcategory.title;

            nextSubcategory = currentSubcategories[subcategoryIndex];
            return (
                <SubcategoryColumn
                    key={selected}
                    level={i}
                    isLastColumn={isLastColumn}
                    selectedSubcategoryId={selected}
                    subcategories={currentSubcategories}
                    title={currentSubcategoryTitle}
                    onNewSubcategory={this.handleNewSubcategory}
                    onSubcategoryClick={this.handleSubcategoryClick}
                    onDrop={this.handleSubcategoryDrop}
                />
            );
        });

        if (selectedSubcategories.length < LIMIT) {
            const currentSubcategories = nextSubcategory.subcategories;
            const currentSubcategoryTitle = nextSubcategory.title;
            subcategoryColumns.push(
                <SubcategoryColumn
                    level={selectedSubcategories.length}
                    key="empty"
                    subcategories={currentSubcategories}
                    title={currentSubcategoryTitle}
                    onNewSubcategory={this.handleNewSubcategory}
                    onSubcategoryClick={this.handleSubcategoryClick}
                    onDrop={this.handleSubcategoryDrop}
                />,
            );
        }

        return subcategoryColumns;
    }


    render() {
        const {
            categories,
            activeCategoryId,
            match,
        } = this.props;

        const {
            showCategoryTitleModal,
            newCategoryTitleInputValue,
            showSubcategoryTitleModal,
            newSubcategoryTitleInputValue,
            showNewManualNGramModal,
            newManualNGramInputValue,
        } = this.state;

        return (
            <div styleName="category-editor">
                { this.state.pending && <LoadingAnimation /> }
                <div styleName="left">
                    <DocumentPanel />
                </div>
                <div styleName="right">
                    <header styleName="header">
                        <div>
                            <h2>
                                {this.props.categoryEditorViewTitle}
                            </h2>
                            <SelectInput
                                label="Category"
                                styleName="category-select"
                                options={categories}
                                onChange={this.handleCategorySelectChange}
                                placeholder="Select category"
                                showHintAndError={false}
                                value={activeCategoryId}
                                keySelector={d => d.id}
                                labelSelector={d => d.title}
                                clearable={false}
                                disabled={this.state.pending}
                            />
                        </div>
                        <div styleName="action-btn">
                            <PrimaryButton
                                styleName="add-category-btn"
                                onClick={this.handleAddCategoryButtonClick}
                                disabled={this.state.pending}
                            >
                                Add
                            </PrimaryButton>

                            { isTruthy(activeCategoryId) &&
                                [
                                    <PrimaryButton
                                        key="edit"
                                        styleName="add-category-btn"
                                        disabled={this.state.pending}
                                    >
                                        Edit
                                    </PrimaryButton>,
                                    <DangerButton
                                        key="remove"
                                        styleName="add-category-btn"
                                        disabled={this.state.pending}
                                    >
                                        Remove
                                    </DangerButton>,
                                ]
                            }

                            <SuccessButton
                                disabled={
                                    this.props.categoryEditorViewPristine || this.state.pending
                                }
                                onClick={this.handleCategoryEditorSaveButtonClick}
                            >
                                Save
                            </SuccessButton>
                        </div>
                    </header>
                    <div styleName="content">
                        <div styleName="sub-categories">
                            {
                                activeCategoryId ? (
                                    this.renderSubcategoryColumns()
                                ) : (
                                    <p styleName="empty">
                                        Such empty
                                    </p>
                                )
                            }
                        </div>
                        <SubcategoryPropertyPanel
                            onNewManualNGram={this.handleNewManualNGram}
                            match={match}
                        />
                    </div>
                </div>
                <Modal
                    styleName="new-category-modal"
                    show={showCategoryTitleModal}
                    onClose={this.handleModalClose}
                >
                    <ModalHeader title="Add new category" />
                    <ModalBody>
                        <TextInput
                            label="Title"
                            placeholder="eg: Sector"
                            onChange={this.handleNewCategoryTitleInputValueChange}
                            value={newCategoryTitleInputValue}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            onClick={this.handleModalCancelButtonClick}
                        >
                            Cancel
                        </Button>
                        <PrimaryButton
                            onClick={this.handleCategoryTitleModalOkButtonClick}
                            styleName="ok-button"
                        >
                            Ok
                        </PrimaryButton>
                    </ModalFooter>
                </Modal>
                <Modal
                    styleName="new-subcategory-modal"
                    show={showSubcategoryTitleModal}
                    onClose={this.handleModalClose}
                >
                    <ModalHeader title="Add new subcategory" />
                    <ModalBody>
                        <TextInput
                            label="Title"
                            placeholder="eg: Wash"
                            onChange={this.handleNewSubcategoryTitleInputValueChange}
                            value={newSubcategoryTitleInputValue}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={this.handleModalCancelButtonClick}>
                            Cancel
                        </Button>
                        <PrimaryButton
                            onClick={this.handleSubcategoryTitleModalOkButtonClick}
                            styleName="ok-button"
                        >
                            Ok
                        </PrimaryButton>
                    </ModalFooter>
                </Modal>
                <Modal
                    styleName="new-manual-ngram-modal"
                    show={showNewManualNGramModal}
                    onClose={this.handleModalClose}
                >
                    <ModalHeader title="Add word manually" />
                    <ModalBody>
                        <TextInput
                            label="Word"
                            placeholder="Wash Fwash"
                            onChange={this.handleNewManualNGramInputValueChange}
                            value={newManualNGramInputValue}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={this.handleModalCancelButtonClick}>
                            Cancel
                        </Button>
                        <PrimaryButton
                            onClick={this.handleNewManualNGramModalOkButtonClick}
                            styleName="ok-button"
                        >
                            Ok
                        </PrimaryButton>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
