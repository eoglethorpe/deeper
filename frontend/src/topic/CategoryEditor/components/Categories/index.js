import CSSModules from 'react-css-modules';
import React from 'react';
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
                    title: 'WASH',
                },
                {
                    id: 2,
                    title: 'FOOD',
                },
                {
                    id: 3,
                    title: 'SHELTER',
                },
                {
                    id: 4,
                    title: 'NFI',
                },
                {
                    id: 5,
                    title: 'PROTECTION',
                },
            ],
            subSubCategoryData: [
                {
                    id: 1,
                    title: 'WATER',
                },
                {
                    id: 2,
                    title: 'SANITATION',
                },
                {
                    id: 3,
                    title: 'HYGIENE',
                },
                {
                    id: 4,
                    title: 'VECTOR CONTROL',
                },
                {
                    id: 5,
                    title: 'WASTE MANAGEMENT',
                },
                {
                    id: 6,
                    title: 'DISAESES',
                },
                {
                    id: 7,
                    title: 'WATER',
                },
                {
                    id: 8,
                    title: 'SANITATION',
                },
                {
                    id: 9,
                    title: 'HYGIENE',
                },
            ],
            activeSubCategory: {
                id: 1,
                title: 'WATER',
            },
            activeSubSubCategoryId: 1,
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

    handleSubSubCategoryClick = (id) => {
        this.setState({
            activeSubSubCategoryId: id,
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
            activeSubSubCategoryId,
        } = this.state;

        return (
            <div styleName="categories">
                <h2>
                    1. Sectors
                </h2>
                <div styleName="category-group">
                    <div styleName="sub-categories">
                        {
                            subCategoryData.map(d => (
                                <div
                                    role="presentation"
                                    key={d.id}
                                    onClick={() => { this.handleSubCategoryClick(d); }}
                                    styleName={`sub-category ${activeSubCategory.id === d.id ? 'active' : ''}`}
                                >
                                    {d.title}
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
                                    role="presentation"
                                    key={d.id}
                                    onClick={() => { this.handleSubSubCategoryClick(d.id); }}
                                    styleName={`sub-sub-category ${activeSubSubCategoryId === d.id ? 'active' : ''}`}
                                >
                                    {d.title}
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
