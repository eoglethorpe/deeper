import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../public/utils/rest';
import { SelectInput } from '../../../public/components/Input';
import {
    PrimaryButton,
    DangerButton,
    SuccessButton,
} from '../../../public/components/Action';
import {
    LoadingAnimation,
    Modal,
} from '../../../public/components/View';
import {
    isTruthy,
    isFalsy,
    randomString,
} from '../../../public/utils/common';

import {
    iconNames,
    ceStrings,
} from '../../../common/constants';

import DocumentPanel from './components/DocumentPanel';
import SubcategoryColumn from './components/SubcategoryColumn';
import SubcategoryPropertyPanel from './components/SubcategoryPropertyPanel';

import {
    categoryEditorViewTitleSelector,
    categoryEditorViewVersionIdSelector,
    categoryEditorViewPristineSelector,
    categoriesSelector,
    activeCategoryIdSelector,

    addNewCategoryAction,
    removeCategoryAction,
    setCategoryAction,

    setActiveCategoryIdAction,
    addNewSubcategoryAction,
    updateSelectedSubcategoriesAction,
    addSubcategoryNGramAction,
    addManualSubcategoryNGramAction,
    setCategoryEditorAction,

    ceIdFromRouteSelector,
} from '../../../common/redux';
import {
    createUrlForCategoryEditor,
    createParamsForUser,
    createParamsForCeViewPatch,
} from '../../../common/rest';
import schema from '../../../common/schema';
import notify from '../../../common/notify';

import NewCategoryModal from './components/NewCategoryModal';
import NewSubcategoryModal from './components/NewSubcategoryModal';
import NewManualNgramModal from './components/NewManualNgramModal';

import styles from './styles.scss';

const mapStateToProps = (state, props) => ({
    categoryEditorViewTitle: categoryEditorViewTitleSelector(state, props),
    categoryEditorViewVersionId: categoryEditorViewVersionIdSelector(state, props),
    categoryEditorViewPristine: categoryEditorViewPristineSelector(state, props),

    categories: categoriesSelector(state, props),
    activeCategoryId: activeCategoryIdSelector(state, props),

    categoryEditorId: ceIdFromRouteSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    addNewCategory: params => dispatch(addNewCategoryAction(params)),
    setCategory: params => dispatch(setCategoryAction(params)),
    removeCategory: params => dispatch(removeCategoryAction(params)),

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

    setCategory: PropTypes.func.isRequired,
    removeCategory: PropTypes.func.isRequired,
    addNewCategory: PropTypes.func.isRequired,
    setActiveCategoryId: PropTypes.func.isRequired,
    addNewSubcategory: PropTypes.func.isRequired,
    updateSelectedSubcategories: PropTypes.func.isRequired,
    addSubcategoryNGram: PropTypes.func.isRequired,
    addManualSubcategoryNGram: PropTypes.func.isRequired,
    setCategoryEditor: PropTypes.func.isRequired,

    categoryEditorId: PropTypes.string.isRequired,
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

            showNewCategoryModal: false,
            showEditCategoryModal: false,
            showNewSubcategoryModal: false,
            showNewManualNGramModal: false,
        };
    }

    componentWillMount() {
        const { categoryEditorId } = this.props;
        this.ceRequest = this.createCeRequest(categoryEditorId);
        this.ceRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { categoryEditorId: oldCategoryEditorId } = this.props;
        const { categoryEditorId: newCategoryEditorId } = nextProps;
        if (oldCategoryEditorId !== newCategoryEditorId) {
            this.ceRequest.stop();
            this.ceRequest = this.createCeRequest(newCategoryEditorId);
            this.ceRequest.start();
        }
    }

    componentWillUnmount() {
        this.ceRequest.stop();
    }

    // REST

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

    handleCategoryEditorSaveButtonClick = () => {
        if (this.saveCeRequest) {
            this.saveCeRequest.stop();
        }

        const { activeCategoryId, categories } = this.props;
        this.saveCeRequest = this.createCeSaveRequest({
            categoryEditorId: this.props.categoryEditorId,
            categoryEditor: {
                activeCategoryId,
                categories,
            },
        });

        this.saveCeRequest.start();
    }

    // SUBCATEGORY DROP & CLICK

    handleSubcategoryDrop = (level, subcategoryId, data) => {
        const { addSubcategoryNGram } = this.props;
        try {
            const ngram = JSON.parse(data);
            addSubcategoryNGram({
                categoryEditorId: this.props.categoryEditorId,
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
        }
    }

    handleSubcategoryClick = (level, subcategoryId) => {
        const { updateSelectedSubcategories } = this.props;
        updateSelectedSubcategories({
            categoryEditorId: this.props.categoryEditorId,
            level,
            subcategoryId,
        });
    }

    // SELECT INPUT

    handleCategorySelectChange = (value) => {
        const { setActiveCategoryId } = this.props;
        setActiveCategoryId({
            categoryEditorId: this.props.categoryEditorId,
            id: value,
        });
    }

    noop = () => {}

    // ADDTION HELPERS
    handleRemoveCategory = () => {
        this.props.removeCategory({
            categoryEditorId: this.props.categoryEditorId,
            id: this.props.activeCategoryId,
        });
    }

    addNewCategory = (title) => {
        const key = randomString();
        const newCategory = {
            categoryEditorId: this.props.categoryEditorId,
            id: key,
            title,
        };
        this.props.addNewCategory(newCategory);
    }

    editCategory = (title) => {
        const newCategory = {
            categoryEditorId: this.props.categoryEditorId,
            id: this.props.activeCategoryId,
            values: { title },
        };
        this.props.setCategory(newCategory);
    }

    addNewSubcategory = ({ title, description }) => {
        const { newSubcategoryLevel: level } = this;
        const id = randomString();
        this.props.addNewSubcategory({
            categoryEditorId: this.props.categoryEditorId,
            level,
            id,
            title,
            description,
        });
    }

    addNewManualNgram = (keyword) => {
        this.props.addManualSubcategoryNGram({
            categoryEditorId: this.props.categoryEditorId,
            ngram: {
                n: keyword.split(' ').length,
                keyword,
            },
        });
    }

    // MODAL OPENERS

    handleNewCategory = () => {
        this.setState({ showNewCategoryModal: true });
    }

    handleEditCategory = () => {
        this.setState({ showEditCategoryModal: true });
    }

    handleNewSubcategory = (level) => {
        this.newSubcategoryLevel = level;
        this.setState({ showNewSubcategoryModal: true });
    }

    handleNewManualNGram = () => {
        this.setState({ showNewManualNGramModal: true });
    };

    // MODAL SUBMIT

    handleNewCategoryModalSubmit = (val) => {
        this.setState({ showNewCategoryModal: false });
        this.addNewCategory(val);
    }

    handleEditCategoryModalSubmit = (val) => {
        this.setState({ showEditCategoryModal: false });
        this.editCategory(val);
    }

    handleNewSubcategoryModalSubmit = (val) => {
        this.setState({ showNewSubcategoryModal: false });
        this.addNewSubcategory(val);
    }

    handleNewManualNgramModalSubmit = (val) => {
        this.setState({ showNewManualNGramModal: false });
        this.addNewManualNgram(val);
    }

    // MODAL CLOSE

    handleNewCategoryModalClose = () => {
        this.setState({ showNewCategoryModal: false });
    }

    handleEditCategoryModalClose = () => {
        this.setState({ showEditCategoryModal: false });
    }

    handleNewSubcategoryModalClose = () => {
        this.setState({ showNewSubcategoryModal: false });
    }

    handleNewManualNgramModalClose = () => {
        this.setState({ showNewManualNGramModal: false });
    }

    // RENDER

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
            categoryEditorViewPristine,
            categoryEditorViewTitle,
        } = this.props;
        const {
            pending,
            showNewCategoryModal,
            showEditCategoryModal,
            showNewSubcategoryModal,
            showNewManualNGramModal,
        } = this.state;

        const activeCategory = categories.find(cat => cat.id === activeCategoryId);

        return (
            <div styleName="category-editor">
                { pending && <LoadingAnimation /> }
                <div styleName="left">
                    <DocumentPanel />
                </div>
                <div styleName="right">
                    <header styleName="header">
                        <div styleName="header-content">
                            <h2>
                                {categoryEditorViewTitle}
                            </h2>
                            <SuccessButton
                                disabled={categoryEditorViewPristine || pending}
                                onClick={this.handleCategoryEditorSaveButtonClick}
                            >
                                {ceStrings.saveCeButtonLabel}
                            </SuccessButton>
                        </div>
                        <div styleName="action-btn">
                            <SelectInput
                                label={ceStrings.headerCategoryLabel}
                                styleName="category-select"
                                options={categories}
                                onChange={this.handleCategorySelectChange}
                                placeholder={ceStrings.selectCategoryPlaceholder}
                                showHintAndError={false}
                                value={activeCategoryId}
                                keySelector={d => d.id}
                                labelSelector={d => d.title}
                                clearable={false}
                                disabled={pending}
                            />
                            <PrimaryButton
                                styleName="add-category-btn"
                                onClick={this.handleNewCategory}
                                disabled={pending}
                                iconName={iconNames.add}
                                title={ceStrings.addCategoryTooltip}
                            />
                            { isTruthy(activeCategoryId) &&
                                [
                                    <PrimaryButton
                                        key="edit"
                                        styleName="add-category-btn"
                                        onClick={this.handleEditCategory}
                                        disabled={pending}
                                        iconName={iconNames.edit}
                                        title={ceStrings.editCategoryTooltip}
                                    />,
                                    <DangerButton
                                        key="remove"
                                        styleName="add-category-btn"
                                        onClick={this.handleRemoveCategory}
                                        disabled={pending}
                                        iconName={iconNames.delete}
                                        title={ceStrings.deleteCategoryTooltip}
                                    />,
                                ]
                            }
                        </div>
                    </header>
                    <div styleName="content">
                        <div styleName="sub-categories">
                            {
                                activeCategoryId ? (
                                    this.renderSubcategoryColumns()
                                ) : (
                                    <p styleName="empty">
                                        {ceStrings.nothingHereText}
                                    </p>
                                )
                            }
                        </div>
                        <SubcategoryPropertyPanel
                            onNewManualNGram={this.handleNewManualNGram}
                        />
                    </div>
                </div>
                <Modal
                    styleName="new-category-modal"
                    show={showNewCategoryModal}
                    onClose={this.noop}
                >
                    <NewCategoryModal
                        onSubmit={this.handleNewCategoryModalSubmit}
                        onClose={this.handleNewCategoryModalClose}
                    />
                </Modal>
                <Modal
                    styleName="edit-category-modal"
                    show={showEditCategoryModal}
                    onClose={this.noop}
                >
                    <NewCategoryModal
                        editMode
                        initialValue={activeCategory}
                        onSubmit={this.handleEditCategoryModalSubmit}
                        onClose={this.handleEditCategoryModalClose}
                    />
                </Modal>
                <Modal
                    styleName="new-subcategory-modal"
                    show={showNewSubcategoryModal}
                    onClose={this.noop}
                >
                    <NewSubcategoryModal
                        onSubmit={this.handleNewSubcategoryModalSubmit}
                        onClose={this.handleNewSubcategoryModalClose}
                    />
                </Modal>
                <Modal
                    styleName="new-manual-ngram-modal"
                    show={showNewManualNGramModal}
                    onClose={this.noop}
                >
                    <NewManualNgramModal
                        onSubmit={this.handleNewManualNgramModalSubmit}
                        onClose={this.handleNewManualNgramModalClose}
                    />
                </Modal>
            </div>
        );
    }
}
