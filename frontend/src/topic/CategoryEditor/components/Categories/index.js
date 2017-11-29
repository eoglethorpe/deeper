import CSSModules from 'react-css-modules';
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.scss';
import KeyWords from '../../components/KeyWords';

import {
    TextInput,
} from '../../../../public/components/Input';
import {
    Modal,
    ModalBody,
    ModalHeader,
    ModalFooter,
} from '../../../../public/components/View';
import {
    PrimaryButton,
    DangerButton,
} from '../../../../public/components/Action';
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
        };
    }

    // For SUB Category Data

    handleAddNewSubCategoryShowModal = () => {
        this.setState({
            addNewSubCategory: true,
        });
    }

    handleSubCategoryClick = (subCategory) => {
        this.setState({
            activeSubCategory: subCategory,
        });
    }

    handleAddNewSubCategoryClose = () => {
        this.setState({
            addNewSubCategory: false,
            newSubCategoryInputValue: '',
        });
    }

    // Adding new SUB Category from + button

    handleAddNewSubCategory = () => {
        this.setState({
            subCategoryData: [
                ...this.state.subCategoryData,
                {
                    id: this.state.newSubCategoryInputValue,
                    title: this.state.newSubCategoryInputValue,
                },
            ],
            newSubCategoryInputValue: '',
            addNewSubCategory: false,
        });
    }

    handleNewSubCategoryInputChange = (value) => {
        this.setState({
            newSubCategoryInputValue: value,
        });
    }

    // For SUB-SUB Category Data

    handleAddNewSubSubCategoryShowModal = () => {
        this.setState({
            addNewSubSubCategory: true,
        });
    }

    handleSubSubCategoryClick = (subSubCategory) => {
        this.setState({
            activeSubSubCategory: subSubCategory,
        });
    }

    handleAddNewSubSubCategoryClose = () => {
        this.setState({
            addNewSubSubCategory: false,
            newSubSubCategoryInputValue: '',
        });
    }

    // Adding new SUB-SUB Category from + button

    handleAddNewSubSubCategory = () => {
        this.setState({
            subSubCategoryData: [
                ...this.state.subSubCategoryData,
                {
                    id: this.state.newSubSubCategoryInputValue,
                    title: this.state.newSubSubCategoryInputValue,
                },
            ],
            newSubSubCategoryInputValue: '',
            addNewSubSubCategory: false,
        });
    }

    handleNewSubSubCategoryInputChange = (value) => {
        this.setState({
            newSubSubCategoryInputValue: value,
        });
    }

    render() {
        const {
            addNewSubCategory,
            addNewSubSubCategory,
            subCategoryData,
            newSubCategoryInputValue,
            activeSubCategory,
            subSubCategoryData,
            newSubSubCategoryInputValue,
            activeSubSubCategory,
        } = this.state;

        return (
            <div styleName="categories">
                <div styleName="category-group">
                    <div styleName="sub-categories">
                        {
                            subCategoryData.map(d => (
                                <div styleName="sub-group">
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
                                <div styleName="sub-group">
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
                    <ModalHeader title="Add New Sub Category" />
                    <ModalBody>
                        <TextInput
                            placeholder="Enter Sub Category Name"
                            label="Name"
                            onChange={this.handleNewSubCategoryInputChange}
                            value={newSubCategoryInputValue}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton
                            onClick={this.handleAddNewSubCategoryClose}
                        >
                            Cancel
                        </DangerButton>
                        <PrimaryButton
                            onClick={this.handleAddNewSubCategory}
                        >
                            Add
                        </PrimaryButton>
                    </ModalFooter>
                </Modal>
                <Modal
                    closeOnEscape
                    onClose={this.handleAddNewSubSubCategoryClose}
                    show={addNewSubSubCategory}
                >
                    <ModalHeader
                        title={`Add Sub Category for ${activeSubCategory.title}`}
                    />
                    <ModalBody>
                        <TextInput
                            placeholder="Enter Sub Sub Category Name"
                            label="Name"
                            onChange={this.handleNewSubSubCategoryInputChange}
                            value={newSubSubCategoryInputValue}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton
                            onClick={this.handleAddNewSubSubCategoryClose}
                        >
                            Cancel
                        </DangerButton>
                        <PrimaryButton
                            onClick={this.handleAddNewSubSubCategory}
                        >
                            Add
                        </PrimaryButton>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
