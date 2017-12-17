import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import {
    SelectInput,
    TextInput,
    Form,
    requiredCondition,
    NonFieldErrors,
} from '../../../../public/components/Input';
import {
    PrimaryButton,
    DangerButton,
    TransparentButton,
} from '../../../../public/components/Action';
import {
    Modal,
    ModalBody,
    ModalHeader,
    LoadingAnimation,
} from '../../../../public/components/View';
import {
    iconNames,
} from '../../../../common/constants';
import {
    randomString,
    isFalsy,
} from '../../../../public/utils/common';

import {
    categoriesListSelector,
    selectedCategorySelector,
    selectedSubCategoryDetailSelector,
    // selectedSubSubCategorySelector,
    subCategoriesForSelectedCategorySelector,
    subSubCategoriesForSelectedSubCategorySelector,
    selectedCategoryIdSelector,
    selectedSubCategoryIdSelector,
    selectedSubSubCategoryIdSelector,

    setActiveCategoryAction,
    setActiveSubCategoryAction,
    setActiveSubSubCategoryAction,
    setCategoryAction,
    addNewCategoryAction,
    addNewSubCategoryAction,
    addNewSubSubCategoryAction,
} from '../../../../common/redux';

import KeyWords from '../../components/KeyWords';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.shape({})),
    selectedCategory: PropTypes.shape({}),
    selectedSubCategory: PropTypes.shape({}),
    // selectedSubSubCategory: PropTypes.shape({}),

    subCategoriesForSelectedCategory: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    subSubCategoriesForSelectedSubCategory: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    selectedCategoryId: PropTypes.number,
    selectedSubCategoryId: PropTypes.number,
    selectedSubSubCategoryId: PropTypes.number,
    setActiveCategory: PropTypes.func.isRequired,
    setActiveSubCategory: PropTypes.func.isRequired,
    setActiveSubSubCategory: PropTypes.func.isRequired,
    setCategory: PropTypes.func.isRequired,
    addNewCategory: PropTypes.func.isRequired,
    addNewSubCategory: PropTypes.func.isRequired,
    addNewSubSubCategory: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    categories: {},
    selectedCategory: {},
    selectedSubCategory: {},
    // selectedSubSubCategory: {},
    selectedCategoryId: undefined,
    selectedSubCategoryId: undefined,
    selectedSubSubCategoryId: undefined,
};

const mapStateToProps = state => ({
    categories: categoriesListSelector(state),
    selectedCategory: selectedCategorySelector(state),
    selectedSubCategory: selectedSubCategoryDetailSelector(state),
    // selectedSubSubCategory: selectedSubSubCategorySelector(state),

    subCategoriesForSelectedCategory: subCategoriesForSelectedCategorySelector(state),
    subSubCategoriesForSelectedSubCategory: subSubCategoriesForSelectedSubCategorySelector(state),

    selectedCategoryId: selectedCategoryIdSelector(state),
    selectedSubCategoryId: selectedSubCategoryIdSelector(state),
    selectedSubSubCategoryId: selectedSubSubCategoryIdSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setActiveCategory: params => dispatch(setActiveCategoryAction(params)),
    setActiveSubCategory: params => dispatch(setActiveSubCategoryAction(params)),
    setActiveSubSubCategory: params => dispatch(setActiveSubSubCategoryAction(params)),
    setCategory: params => dispatch(setCategoryAction(params)),
    addNewCategory: params => dispatch(addNewCategoryAction(params)),
    addNewSubCategory: params => dispatch(addNewSubCategoryAction(params)),
    addNewSubSubCategory: params => dispatch(addNewSubSubCategoryAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Categories extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    constructor(props) {
        super(props);

        this.state = {
            // Add Modal state
            addNewCategory: false,
            addNewSubCategory: false,
            addNewSubSubCategory: false,
            editCategoryModal: false,
            formErrors: [],
            formFieldErrors: {},
            formValues: [],
            pending: false,
            pristine: false,
        };

        this.elements = [
            'subLabel',
            'subSubLabel',
            'label',
            'description',
            'owner',
        ];

        this.validations = {
            label: [requiredCondition],
            description: [requiredCondition],
            owner: [requiredCondition],
            subLabel: [requiredCondition],
            subSubLabel: [requiredCondition],
        };

        // this.createRequestForCategory();
    }

    // For Category Data

    handleAddNewCategoryClick = () => {
        this.setState({ addNewCategory: true });
    }

    handleAddNewCategoryClose = () => {
        this.setState({
            addNewCategory: false,
            formValues: [],
        });
    }

    handleCategorySelectChange = (key) => {
        this.props.setActiveCategory(key);
    }

    // FORM success Category Data

    successCallback = (values) => {
        // TODO: add rest
        this.props.addNewCategory({
            category: {
                ...values,
                id: (this.props.categories || []).length + 1,
            },
        });
        this.setState({
            addNewCategory: false,
            formValues: [],
        });
    }

    // For SUB Category Data

    handleAddNewSubCategoryShowModal = () => {
        this.setState({ addNewSubCategory: true });
    }

    handleSubCategoryClick = (subCategory) => {
        this.props.setActiveSubCategory(subCategory.id);
    }

    handleAddNewSubCategoryClose = () => {
        this.setState({
            addNewSubCategory: false,
            formValues: [],

        });
    }

    createRequestForCategory = () => {
        // TODO: remove this and pull data from api
        const data = {
            id: 1,
            label: 'Sectors',
            subCategories: [
                {
                    id: 1,
                    label: 'wash',
                    subSubCategories: [
                        {
                            id: 1,
                            label: 'water',
                            keywords: [
                                { id: 1, label: 'sickness', count: 331 },
                                { id: 2, label: 'cholera', count: 298 },
                            ],
                        },
                        {
                            id: 2,
                            label: 'sanitation',
                            keywords: [
                                { id: 1, label: 'Pump', count: 31 },
                                { id: 2, label: 'Latrines', count: 125 },
                            ],
                        },
                    ],
                },
                {
                    id: 2,
                    label: 'food',
                    subSubCategories: [
                        {
                            id: 1,
                            label: 'nutrition',
                            keywords: [
                                { id: 1, label: 'potato', count: 331 },
                                { id: 2, label: 'tomato', count: 298 },
                            ],
                        },
                        {
                            id: 2,
                            label: 'malnutrition',
                            keywords: [
                                { id: 1, label: 'kwasiorkor', count: 31 },
                                { id: 2, label: 'sukenas', count: 125 },
                            ],
                        },
                    ],
                },
            ],
        };
        this.props.setCategory({ category: data });
    }

    // Common FORM functions

    changeCallback = (values, { formErrors, formFieldErrors }) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
            pristine: true,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    // FORM success Sub-Category

    subCategorySuccessCallback = (values) => {
        // TODO: add rest
        this.props.addNewSubCategory({
            category: { id: this.props.selectedCategoryId },
            subCategory: {
                label: values.subLabel,
                id: randomString(5),
            },
        });
        this.setState({
            addNewSubCategory: false,
            formValues: [],
        });
    }

    // For SUB-SUB Category Data

    handleAddNewSubSubCategoryShowModal = () => {
        this.setState({ addNewSubSubCategory: true });
    }

    handleSubSubCategoryClick = (subSubCategory) => {
        this.props.setActiveSubSubCategory(subSubCategory.id);
    }

    handleAddNewSubSubCategoryClose = () => {
        this.setState({
            addNewSubSubCategory: false,
            newSubSubCategoryInputValue: '',
        });
    }

    // FORM success Sub-Sub-Category

    subSubCategorySuccessCallback = (values) => {
        // TODO: add rest
        this.props.addNewSubSubCategory({
            subCategory: { id: this.props.selectedSubCategoryId },
            subSubCategory: {
                label: values.subSubLabel,
                id: randomString(5),
            },
        });
        this.setState({
            addNewSubSubCategory: false,
            formValues: [],
        });
    }

    render() {
        const {
            addNewCategory,
            addNewSubCategory,
            addNewSubSubCategory,
            formFieldErrors,
            formValues,
            pending,
            pristine,
            formErrors = [],
        } = this.state;

        const {
            className,
            categories,

            selectedCategory,
            selectedSubCategory,

            subCategoriesForSelectedCategory,
            subSubCategoriesForSelectedSubCategory,

            selectedCategoryId,
            selectedSubCategoryId,
            selectedSubSubCategoryId,
        } = this.props;

        return (
            <div styleName={className}>
                <div styleName="header">
                    <div styleName="search-category">
                        <SelectInput
                            placeholder="Select a Category"
                            label="Category"
                            showHintAndError={false}
                            options={categories}
                            keySelector={category => category.id}
                            labelSelector={category => category.label}
                            value={selectedCategoryId}
                            showLabel
                            clearable={false}
                            onChange={this.handleCategorySelectChange}
                        />
                    </div>
                    <div styleName="pusher" />
                    <div styleName="add-category-btn">
                        <PrimaryButton
                            onClick={this.handleAddNewCategoryClick}
                        >
                            Add New Category
                        </PrimaryButton>
                    </div>
                </div>
                <div styleName="categories">
                    <div styleName="category-group">
                        <div styleName="sub-categories">
                            {
                                subCategoriesForSelectedCategory.map(d => (
                                    <div
                                        styleName="sub-group"
                                        key={d.id}
                                    >
                                        <div
                                            role="presentation"
                                            key={d.id}
                                            onClick={() => { this.handleSubCategoryClick(d); }}
                                            styleName={`sub-category ${selectedSubCategoryId === d.id ? 'active' : ''}`}
                                        >
                                            {d.label}
                                        </div>
                                        <div styleName="icon-btn">
                                            <span
                                                className={`${selectedSubCategoryId === d.id ? iconNames.chevronRight : ''}`}
                                            />
                                        </div>
                                    </div>
                                ))
                            }
                            <TransparentButton
                                styleName="add-button"
                                onClick={this.handleAddNewSubCategoryShowModal}
                                type="button"
                                disabled={isFalsy(selectedCategoryId)}
                            >
                                <i className={iconNames.add} />
                            </TransparentButton>
                        </div>
                        <div styleName="sub-sub-categories">
                            {
                                subSubCategoriesForSelectedSubCategory.map(d => (
                                    <div
                                        styleName="sub-group"
                                        key={d.id}
                                    >
                                        <div
                                            role="presentation"
                                            key={d.id}
                                            onClick={() => { this.handleSubSubCategoryClick(d); }}
                                            styleName={`sub-sub-category ${selectedSubSubCategoryId === d.id ? 'active' : ''}`}
                                        >
                                            {d.label}
                                        </div>
                                        <div styleName="icon-btn">
                                            <Link
                                                title="Edit Sub Category"
                                                className={`${selectedSubSubCategoryId === d.id ? iconNames.edit : ''}`}
                                                to={`/edit/${selectedSubCategoryId}/${d.id}/`}
                                            />
                                            <span
                                                className={`${selectedSubSubCategoryId === d.id ? iconNames.delete : ''}`}
                                            />
                                        </div>
                                    </div>
                                ))
                            }
                            <TransparentButton
                                onClick={this.handleAddNewSubSubCategoryShowModal}
                                styleName={`${isFalsy(selectedSubCategoryId) ? 'hidden' : 'add-button'}`}
                                type="button"
                            >
                                <i className={iconNames.add} />
                            </TransparentButton>
                        </div>
                        <KeyWords
                            className="keywords-content"
                        />
                    </div>
                    {/* For Category Data */}
                    <Modal
                        closeOnEscape
                        onClose={this.handleAddNewCategoryClose}
                        show={addNewCategory}
                    >
                        <Form
                            changeCallback={this.changeCallback}
                            elements={this.elements}
                            failureCallback={this.failureCallback}
                            successCallback={this.successCallback}
                            validations={this.validations}
                        >
                            <ModalHeader title="Add New Category" />
                            {
                                pending && <LoadingAnimation />
                            }
                            <NonFieldErrors errors={formErrors} />
                            <ModalBody>
                                <TextInput
                                    formname="label"
                                    placeholder="Enter Category Name"
                                    label="Name"
                                    value={formValues.label}
                                    error={formFieldErrors.label}
                                />
                                <TextInput
                                    formname="description"
                                    placeholder="Enter Description"
                                    label="Description"
                                    value={formValues.description}
                                    error={formFieldErrors.description}
                                />
                                <TextInput
                                    formname="owner"
                                    placeholder="Enter Owner's Name"
                                    label="Owner"
                                    value={formValues.owner}
                                    error={formFieldErrors.owner}
                                />
                            </ModalBody>
                            <div styleName="action-buttons">
                                <DangerButton
                                    onClick={this.handleAddNewCategoryClose}
                                    type="button"
                                    disabled={pending}
                                >
                                    Cancel
                                </DangerButton>
                                <PrimaryButton
                                    disabled={pending || !pristine}
                                >
                                    Save
                                </PrimaryButton>
                            </div>
                        </Form>
                    </Modal>
                    {/* For Sub-Category Data */}
                    <Modal
                        closeOnEscape
                        onClose={this.handleAddNewSubCategoryClose}
                        show={addNewSubCategory}
                    >
                        <Form
                            changeCallback={this.changeCallback}
                            elements={this.elements}
                            failureCallback={this.failureCallback}
                            successCallback={this.subCategorySuccessCallback}
                            validations={this.validations}
                        >
                            <ModalHeader
                                title={`Add New Sub Category for ${selectedCategory.label}`}
                            />
                            {
                                pending && <LoadingAnimation />
                            }
                            <NonFieldErrors errors={formErrors} />
                            <ModalBody>
                                <TextInput
                                    formname="subLabel"
                                    placeholder="Enter Subss Category Name"
                                    label="Name"
                                    value={formValues.subLabel}
                                    error={formFieldErrors.subLabel}
                                />
                            </ModalBody>
                            <div styleName="action-buttons">
                                <DangerButton
                                    onClick={this.handleAddNewSubCategoryClose}
                                    type="button"
                                    disabled={pending}
                                >
                                    Cancel
                                </DangerButton>
                                <PrimaryButton
                                    disabled={pending || !pristine}
                                >
                                    Add
                                </PrimaryButton>
                            </div>
                        </Form>
                    </Modal>
                    {/* For Sub-Sub-Category Data */}
                    <Modal
                        closeOnEscape
                        onClose={this.handleAddNewSubSubCategoryClose}
                        show={addNewSubSubCategory}
                    >
                        <Form
                            changeCallback={this.changeCallback}
                            elements={this.elements}
                            failureCallback={this.failureCallback}
                            successCallback={this.subSubCategorySuccessCallback}
                            validations={this.validations}
                        >
                            <ModalHeader
                                title={`Add New Sub-Sub Category for ${selectedSubCategory.label}`}
                            />
                            <ModalBody>
                                <TextInput
                                    formname="subSubLabel"
                                    placeholder="Enter Sub Sub Category Name"
                                    label="Name"
                                    value={formValues.subSubLabel}
                                    error={formFieldErrors.subSubLabel}
                                />
                            </ModalBody>
                            <div styleName="action-buttons">
                                <DangerButton
                                    onClick={this.handleAddNewSubSubCategoryClose}
                                    type="button"
                                    disabled={pending}
                                >
                                    Cancel
                                </DangerButton>
                                <PrimaryButton
                                    disabled={pending || !pristine}
                                >
                                    Add
                                </PrimaryButton>
                            </div>
                        </Form>
                    </Modal>
                </div>
            </div>
        );
    }
}
