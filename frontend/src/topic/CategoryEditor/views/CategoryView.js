import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import {
    SelectInput,
    TextInput,
    TextArea,
} from '../../../public/components/Input';
import {
    Modal,
    ModalBody,
    ModalHeader,
    ModalFooter,
} from '../../../public/components/View';
import {
    PrimaryButton,
    DangerButton,
} from '../../../public/components/Action';
import styles from './styles.scss';
import Categories from '../components/Categories';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class CategoryView extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            // Add Modal state
            addNewCategory: false,
            categoryData: [
                {
                    key: 1,
                    label: 'Sectors',
                    description: '',
                    owner: 'Jacky',
                },
                {
                    key: 2,
                    label: 'Affected Groups',
                    description: '',
                    owner: 'Jacky',
                },
                {
                    key: 3,
                    label: 'Demographic Groups',
                    description: '',
                    owner: 'Jacky',
                },
            ],
            activeCategory: 1,
        };
    }
    handleAddNewCategoryClick = () => {
        this.setState({ addNewCategory: true });
    }

    handleAddNewCategoryClose = () => {
        this.setState({
            addNewCategory: false,
            newCategoryInputValue: '',
        });
    }

    handleNewCategoryInputLabelChange = (value) => {
        this.setState({
            newCategoryInputLabelValue: value,
        });
    }

    handleNewCategoryInputDescriptionChange = (value) => {
        this.setState({
            newCategoryInputDescriptionValue: value,
        });
    }

    handleNewCategoryInputOwnerChange = (value) => {
        this.setState({
            newCategoryInputOwnerValue: value,
        });
    }

    handleAddNewCategory = () => {
        this.setState({
            categoryData: [
                ...this.state.categoryData,
                {
                    key: this.state.newCategoryInputLabelValue,
                    label: this.state.newCategoryInputLabelValue,
                    description: this.state.newCategoryInputDescriptionValue,
                    owner: this.state.newCategoryInputOwnerValue,
                },
            ],
            newCategoryInputLabelValue: '',
            newCategoryInputDescriptionValue: '',
            newCategoryInputOwnerValue: '',
            addNewCategory: false,
        });
    }

    handleCategorySelectChange = (key) => {
        this.setState({
            activeCategory: key,
        });
    }
    render() {
        const cat = this.state.categoryData.find(
            d => d.key === this.state.activeCategory,
        );
        const {
            addNewCategory,
            newCategoryInputLabelValue,
            newCategoryInputDescriptionValue,
            newCategoryInputOwnerValue,
            activeCategory,
        } = this.state;
        return (
            <div styleName={this.props.className}>
                <div styleName="header">
                    <div styleName="search-category">
                        <SelectInput
                            placeholder="Select a Category"
                            showLabel={false}
                            showHintAndError={false}
                            options={this.state.categoryData}
                            value={activeCategory}
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
                <h2>
                    {cat.label}
                </h2>
                <Categories />
                <Modal
                    closeOnEscape
                    onClose={this.handleAddNewCategoryClose}
                    show={addNewCategory}
                >
                    <ModalHeader title="Add New Category" />
                    <ModalBody>
                        <TextInput
                            placeholder="Enter Category Name"
                            label="Title"
                            onChange={this.handleNewCategoryInputLabelChange}
                            value={newCategoryInputLabelValue}
                        />
                        <TextArea
                            placeholder="Enter Description"
                            label="Description"
                            onChange={this.handleNewCategoryInputDescriptionChange}
                            value={newCategoryInputDescriptionValue}
                        />
                        <TextInput
                            placeholder="Enter Owner's Name"
                            label="Owner"
                            onChange={this.handleNewCategoryInputOwnerChange}
                            value={newCategoryInputOwnerValue}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton
                            onClick={this.handleAddNewCategoryClose}
                        >
                            Cancel
                        </DangerButton>
                        <PrimaryButton
                            onClick={this.handleAddNewCategory}
                        >
                            Save
                        </PrimaryButton>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
