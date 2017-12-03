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
} from '../../../../public/components/Action';
import {
    Modal,
    ModalBody,
    ModalHeader,
    LoadingAnimation,
} from '../../../../public/components/View';
import { randomString } from '../../../../public/utils/common';

import {
    categoriesSelector,
    selectedCategorySelector,
    selectedSubCategorySelector,
    selectedSubSubCategorySelector,
    selectedCategoryIdSelector,
    setActiveCategoryAction,
    setActiveSubCategoryAction,
    setActiveSubSubCategoryAction,

} from '../../../../common/redux';

import KeyWords from '../../components/KeyWords';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    categories: PropTypes.array, // eslint-disable-line
    selectedCategory: PropTypes.object, // eslint-disable-line
    selectedSubCategory: PropTypes.object, // eslint-disable-line
    selectedSubSubCategory: PropTypes.object, // eslint-disable-line
    selectedCategoryId: PropTypes.number,
    setActiveCategory: PropTypes.func.isRequired,
    setActiveSubCategory: PropTypes.func.isRequired,
    setActiveSubSubCategory: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    categories: {},
    selectedCategory: {},
    selectedSubCategory: {},
    selectedSubSubCategory: {},
    selectedCategoryId: undefined,
};

const mapStateToProps = state => ({
    categories: categoriesSelector(state),
    selectedCategory: selectedCategorySelector(state),
    selectedSubCategory: selectedSubCategorySelector(state),
    selectedSubSubCategory: selectedSubSubCategorySelector(state),
    selectedCategoryId: selectedCategoryIdSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setActiveCategory: params => dispatch(setActiveCategoryAction(params)),
    setActiveSubCategory: params => dispatch(setActiveSubCategoryAction(params)),
    setActiveSubSubCategory: params => dispatch(setActiveSubSubCategoryAction(params)),
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
            categoryData: [
                {
                    key: 1,
                    label: 'Sectors',
                    description: 'WaduHek',
                    owner: 'Jacky',
                },
                {
                    key: 2,
                    label: 'Affected Groups',
                    description: 'WaduHek',
                    owner: 'Jacky',
                },
                {
                    key: 3,
                    label: 'Demographic Groups',
                    description: 'WaduHek',
                    owner: 'Jacky',
                },
            ],
            subCategoryData: [
                {
                    id: 1,
                    title: 'wash',
                },
                {
                    id: 2,
                    title: 'food',
                },
                {
                    id: 3,
                    title: 'shelter',
                },
                {
                    id: 4,
                    title: 'nfi',
                },
                {
                    id: 5,
                    title: 'protection',
                },
            ],
            subSubCategoryData: [
                {
                    id: 1,
                    title: 'water',
                },
                {
                    id: 2,
                    title: 'sanitation',
                },
                {
                    id: 3,
                    title: 'hygiene',
                },
                {
                    id: 4,
                    title: 'vector control',
                },
                {
                    id: 5,
                    title: 'waste management',
                },
                {
                    id: 6,
                    title: 'diseases',
                },
                {
                    id: 7,
                    title: 'bad water',
                },
                {
                    id: 8,
                    title: 'sanitation',
                },
                {
                    id: 9,
                    title: 'dysentery',
                },
            ],
            activeSubCategory: {
                id: 1,
                title: 'wash',
            },
            activeSubSubCategory: {
                id: 1,
                title: 'water',
            },
            editCategoryModal: false,
            formErrors: [],
            formFieldErrors: {},
            formValues: [],
            pending: false,
            stale: false,
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
        this.setState({
            categoryData: [
                ...this.state.categoryData,
                {
                    key: randomString(),
                    label: values.label,
                    description: values.description,
                    owner: values.owner,
                },
            ],
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


    // Common FORM functions

    changeCallback = (values, { formErrors, formFieldErrors }) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
            stale: true,
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
        this.setState({
            subCategoryData: [
                ...this.state.subCategoryData,
                {
                    id: randomString(),
                    title: values.subLabel,
                },
            ],
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
        this.setState({
            subSubCategoryData: [
                ...this.state.subSubCategoryData,
                {
                    id: randomString(),
                    title: values.subSubLabel,
                },
            ],
            addNewSubSubCategory: false,
            formValues: [],
        });
    }

    render() {
        const {
            addNewCategory,
            addNewSubCategory,
            addNewSubSubCategory,
            activeSubCategory,
            activeSubSubCategory,
            formFieldErrors,
            formValues,
            pending,
            stale,
            formErrors = [],
        } = this.state;

        const {
            className,
            categories,
            selectedCategory,
            selectedSubCategory,
            selectedSubSubCategory,
        } = this.props;

        console.log(categories);
        console.log(selectedCategory);
        console.log(selectedSubCategory);
        console.log(selectedSubSubCategory);

        return (
            <div styleName={className}>
                <div styleName="header">
                    <div styleName="search-category">
                        <SelectInput
                            placeholder="Select a Category"
                            label="Category"
                            showHintAndError={false}
                            options={this.props.categories}
                            keySelector={category => category.id}
                            labelSelector={category => category.label}
                            value={this.props.selectedCategoryId}
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
                                selectedCategory.subCategories.map(d => (
                                    <div
                                        styleName="sub-group"
                                        key={d.id}
                                    >
                                        <div
                                            role="presentation"
                                            key={d.id}
                                            onClick={() => { this.handleSubCategoryClick(d); }}
                                            styleName={`sub-category ${activeSubCategory.id === d.id ? 'active' : ''}`}
                                        >
                                            {d.label}
                                        </div>
                                        <div styleName="icon-btn">
                                            <span
                                                className={`${activeSubCategory.id === d.id ? 'ion-chevron-right' : ''}`}
                                            />
                                        </div>
                                    </div>
                                ))
                            }
                            <div
                                styleName="add-button"
                                onClick={this.handleAddNewSubCategoryShowModal}
                                role="presentation"
                            >
                                <i className="ion-plus" />
                            </div>
                        </div>
                        <div styleName="sub-sub-categories">
                            {
                                selectedSubCategory.subSubCategories.map(d => (
                                    <div
                                        styleName="sub-group"
                                        key={d.id}
                                    >
                                        <div
                                            role="presentation"
                                            key={d.id}
                                            onClick={() => { this.handleSubSubCategoryClick(d); }}
                                            styleName={`sub-sub-category ${activeSubSubCategory.id === d.id ? 'active' : ''}`}
                                        >
                                            {d.label}
                                        </div>
                                        <div styleName="icon-btn">
                                            <Link
                                                title="Edit Sub Category"
                                                className={`${activeSubSubCategory.id === d.id ? 'ion-edit' : ''}`}
                                                to={`/edit/${selectedSubCategory.label}/${d.label}/`}
                                            />
                                            <span
                                                className={`${activeSubSubCategory.id === d.id ? 'ion-android-delete' : ''}`}
                                            />
                                        </div>
                                    </div>
                                ))
                            }
                            <div
                                styleName="add-button"
                                onClick={this.handleAddNewSubSubCategoryShowModal}
                                role="presentation"
                            >
                                <i className="ion-plus" />
                            </div>
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
                                    disabled={pending || !stale}
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
                            <ModalHeader title="Add New Sub Category" />
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
                                    disabled={pending || !stale}
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
                                title={`Add Sub Category for ${activeSubCategory.title}`}
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
                                    disabled={pending || !stale}
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
