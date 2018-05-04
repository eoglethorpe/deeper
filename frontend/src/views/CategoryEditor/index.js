import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    Link,
    Prompt,
} from 'react-router-dom';

import BoundError from '../../vendor/react-store/components/General/BoundError';
import {
    isTruthy,
    checkVersion,
    randomString,
    trimWhitespace,
    splitInWhitespace,
    reverseRoute,
} from '../../vendor/react-store/utils/common';
import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import SelectInput from '../../vendor/react-store/components/Input/SelectInput';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import DangerButton from '../../vendor/react-store/components/Action/Button/DangerButton';
import SuccessButton from '../../vendor/react-store/components/Action/Button/SuccessButton';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import Modal from '../../vendor/react-store/components/View/Modal';
import Confirm from '../../vendor/react-store/components/View/Modal/Confirm';

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
    activeProjectIdFromStateSelector,
} from '../../redux';
import {
    createUrlForCategoryEditor,
    createParamsForUser,
    createParamsForCeViewPatch,
    transformResponseErrorToFormError,
} from '../../rest';
import {
    iconNames,
    pathNames,
} from '../../constants';
import schema from '../../schema';
import notify from '../../notify';
import _ts from '../../ts';
import AppError from '../../components/AppError';

import DocumentPanel from './DocumentPanel';
import NewCategoryModal from './NewCategoryModal';
import NewManualNgramModal from './NewManualNgramModal';
import NewSubcategoryModal from './NewSubcategoryModal';
import SubcategoryColumn from './SubcategoryColumn';
import SubcategoryPropertyPanel from './SubcategoryPropertyPanel';

import styles from './styles.scss';

const mapStateToProps = (state, props) => ({
    categoryEditorViewTitle: categoryEditorViewTitleSelector(state, props),
    categoryEditorViewVersionId: categoryEditorViewVersionIdSelector(state, props),
    categoryEditorViewPristine: categoryEditorViewPristineSelector(state, props),

    categories: categoriesSelector(state, props),
    activeCategoryId: activeCategoryIdSelector(state, props),

    categoryEditorId: ceIdFromRouteSelector(state, props),
    projectId: activeProjectIdFromStateSelector(state, props),
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

    categoryEditorId: PropTypes.number.isRequired,

    projectId: PropTypes.number.isRequired,
};

const defaultProps = {
    activeCategoryId: undefined,
    categoryEditorViewVersionId: undefined,
    categoryEditorViewPristine: undefined,
};

const DEPTH_LIMIT = 5;

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
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

            confirmText: '',
            deleteCategory: false,
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

                    const { categoryEditorViewVersionId } = this.props;

                    const {
                        shouldSetValue,
                        isValueOverriden,
                    } = checkVersion(categoryEditorViewVersionId, response.versionId);

                    if (shouldSetValue) {
                        this.props.setCategoryEditor({ categoryEditor: response });
                    }
                    if (isValueOverriden) {
                        notify.send({
                            type: notify.type.WARNING,
                            title: _ts('notification', 'ceUpdate'),
                            message: _ts('notification', 'ceUpdateOverridden'),
                            duration: notify.duration.SLOW,
                        });
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

                    notify.send({
                        title: 'Category Editor', // FIXME: write
                        type: notify.type.SUCCESS,
                        message: 'Category Editor saved successfully',
                        duration: notify.duration.SLOW,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                // FIXME: transformResponse to alterResponse
                const message = transformResponseErrorToFormError(response.errors)
                    .formErrors
                    .errors
                    .join(' ');
                notify.send({
                    title: 'Category Editor', // FIXME: write
                    type: notify.type.ERROR,
                    message, // FIXME: write
                    duration: notify.duration.SLOW,
                });
            })
            .fatal(() => {
                notify.send({
                    title: 'Category Editor', // FIXME: write
                    type: notify.type.ERROR,
                    message: 'Save unsuccessful', // FIXME: write
                    duration: notify.duration.SLOW,
                });
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
                title: _ts('notification', 'invalidDropSource'),
                message: _ts('notification', 'validDropAlert'),
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
        const { activeCategoryId, categories } = this.props;
        const activeCategory = categories.find(cat => cat.id === activeCategoryId);
        const confirmText = _ts('ce', 'confirmTextDeleteCategory', {
            category: activeCategory.title,
        });

        this.setState({
            deleteCategory: true,
            confirmText,
        });
    }
    // Close Delete Modal
    handleRemoveCategoryClose = (confirm) => {
        if (confirm) {
            this.props.removeCategory({
                categoryEditorId: this.props.categoryEditorId,
                id: this.props.activeCategoryId,
            });
        }
        this.setState({ deleteCategory: false });
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
        const n = splitInWhitespace(keyword).length;
        const sanitizedKeyword = trimWhitespace(keyword);
        this.props.addManualSubcategoryNGram({
            categoryEditorId: this.props.categoryEditorId,
            ngram: {
                n,
                keyword: sanitizedKeyword,
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

        if (selectedSubcategories.length < DEPTH_LIMIT) {
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
            projectId,
        } = this.props;
        const {
            pending,
            confirmText,
            deleteCategory,
            showNewCategoryModal,
            showEditCategoryModal,
            showNewSubcategoryModal,
            showNewManualNGramModal,
        } = this.state;

        const activeCategory = categories.find(cat => cat.id === activeCategoryId);

        return (
            <div className={styles.categoryEditor}>
                { pending && <LoadingAnimation large /> }
                <Prompt
                    when={!categoryEditorViewPristine}
                    message={_ts('common', 'youHaveUnsavedChanges')}
                />
                <div className={styles.left}>
                    <DocumentPanel projectId={projectId} />
                </div>
                <div className={styles.right}>
                    <header className={styles.header}>
                        <div className={styles.headerContent}>
                            <h2>
                                {categoryEditorViewTitle}
                            </h2>
                            <SuccessButton
                                disabled={categoryEditorViewPristine || pending}
                                onClick={this.handleCategoryEditorSaveButtonClick}
                            >
                                {_ts('ce', 'saveCeButtonLabel')}
                            </SuccessButton>
                            <Link
                                disabled={categoryEditorViewPristine || pending}
                                className={styles.linkToPp}
                                to={`${reverseRoute(pathNames.projects, { projectId })}#/category-editor`}
                                replace
                            >
                                {_ts('ce', 'exitButtonLabel')}
                            </Link>
                        </div>
                        <div className={styles.actionBtn}>
                            <SelectInput
                                label={_ts('ce', 'headerCategoryLabel')}
                                className={styles.categorySelect}
                                options={categories}
                                onChange={this.handleCategorySelectChange}
                                placeholder={_ts('ce', 'selectCategoryPlaceholder')}
                                showHintAndError={false}
                                value={activeCategoryId}
                                keySelector={d => d.id}
                                labelSelector={d => d.title}
                                hideClearButton
                                disabled={pending}
                            />
                            <PrimaryButton
                                className={styles.addCategoryBtn}
                                onClick={this.handleNewCategory}
                                disabled={pending}
                                iconName={iconNames.add}
                                title={_ts('ce', 'addCategoryTooltip')}
                            />
                            { isTruthy(activeCategoryId) &&
                                [
                                    <PrimaryButton
                                        key="edit"
                                        className={styles.addCategoryBtn}
                                        onClick={this.handleEditCategory}
                                        disabled={pending}
                                        iconName={iconNames.edit}
                                        title={_ts('ce', 'editCategoryTooltip')}
                                    />,
                                    <DangerButton
                                        key="remove"
                                        className={styles.addCategoryBtn}
                                        onClick={this.handleRemoveCategory}
                                        disabled={pending}
                                        iconName={iconNames.delete}
                                        title={_ts('ce', 'deleteCategoryTooltip')}
                                    />,
                                ]
                            }
                        </div>
                    </header>
                    <div className={styles.content}>
                        <div className={styles.subCategories}>
                            {
                                activeCategoryId ? (
                                    this.renderSubcategoryColumns()
                                ) : (
                                    <p className={styles.empty}>
                                        {_ts('ce', 'nothingHereText')}
                                    </p>
                                )
                            }
                        </div>
                        <SubcategoryPropertyPanel
                            onNewManualNGram={this.handleNewManualNGram}
                        />
                    </div>
                </div>
                { showNewCategoryModal &&
                    <Modal
                        className={styles.newCategoryModal}
                        onClose={this.noop}
                    >
                        <NewCategoryModal
                            onSubmit={this.handleNewCategoryModalSubmit}
                            onClose={this.handleNewCategoryModalClose}
                        />
                    </Modal>
                }
                { showEditCategoryModal &&
                    <Modal
                        className={styles.editCategoryModal}
                        onClose={this.noop}
                    >
                        <NewCategoryModal
                            editMode
                            initialValue={activeCategory}
                            onSubmit={this.handleEditCategoryModalSubmit}
                            onClose={this.handleEditCategoryModalClose}
                        />
                    </Modal>
                }
                { showNewSubcategoryModal &&
                    <Modal
                        className={styles.newSubcategoryModal}
                        onClose={this.noop}
                    >
                        <NewSubcategoryModal
                            onSubmit={this.handleNewSubcategoryModalSubmit}
                            onClose={this.handleNewSubcategoryModalClose}
                        />
                    </Modal>
                }
                { showNewManualNGramModal &&
                    <Modal
                        className={styles.newManualNgramModal}
                        onClose={this.noop}
                    >
                        <NewManualNgramModal
                            onSubmit={this.handleNewManualNgramModalSubmit}
                            onClose={this.handleNewManualNgramModalClose}
                        />
                    </Modal>
                }
                <Confirm
                    onClose={this.handleRemoveCategoryClose}
                    show={deleteCategory}
                >
                    <p>
                        {confirmText}
                    </p>
                </Confirm>
            </div>
        );
    }
}
