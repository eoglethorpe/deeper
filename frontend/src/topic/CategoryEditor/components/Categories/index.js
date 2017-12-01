import CSSModules from 'react-css-modules';
import React from 'react';
import { Link } from 'react-router-dom';

import {
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

import KeyWords from '../../components/KeyWords';

import styles from './styles.scss';

@CSSModules(styles, { allowMultiple: true })
export default class Categories extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            // Add Modal state
            addNewSubCategory: false,
            addNewSubSubCategory: false,
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
        ];

        this.validations = {
            subLabel: [requiredCondition],
            subSubLabel: [requiredCondition],
        };
    }

    // For SUB Category Data

    handleAddNewSubCategoryShowModal = () => {
        this.setState({ addNewSubCategory: true });
    }

    handleSubCategoryClick = (subCategory) => {
        this.setState({ activeSubCategory: subCategory });
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
        this.setState({ activeSubSubCategory: subSubCategory });
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
            addNewSubCategory,
            addNewSubSubCategory,
            subCategoryData,
            activeSubCategory,
            subSubCategoryData,
            activeSubSubCategory,
            formFieldErrors,
            formValues,
            pending,
            stale,
            formErrors = [],
        } = this.state;

        return (
            <div styleName="categories">
                <div styleName="category-group">
                    <div styleName="sub-categories">
                        {
                            subCategoryData.map(d => (
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
                                        {d.title}
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
                            subSubCategoryData.map(d => (
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
                                        {d.title}
                                    </div>
                                    <div styleName="icon-btn">
                                        <Link
                                            title="Edit Sub Category"
                                            className={`${activeSubSubCategory.id === d.id ? 'ion-edit' : ''}`}
                                            to={`/edit/${activeSubCategory.title}/${d.title}/`}
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
        );
    }
}
