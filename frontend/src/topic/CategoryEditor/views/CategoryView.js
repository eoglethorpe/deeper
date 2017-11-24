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

        };
    }
    handleAddNewCategoryClick = () => {
        this.setState({ addNewCategory: true });
    }
    handleAddNewCategoryClose = () => {
        this.setState({ addNewCategory: false });
    }
    render() {
        const { addNewCategory } = this.state;
        return (
            <div styleName={this.props.className}>
                <div styleName="header">
                    <div styleName="search-category">
                        <SelectInput
                            placeholder="Select a Category"
                            showLabel={false}
                            showHintAndError={false}
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
                            label="Name"
                        />
                        <TextArea
                            placeholder="Enter Description"
                            label="Description"
                        />
                        <TextInput
                            placeholder="Enter Owner's Name"
                            label="Owner"
                        />
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton
                            onClick={this.handleAddNewCategoryClose}
                        >
                            Cancel
                        </DangerButton>
                        <PrimaryButton>
                            Save
                        </PrimaryButton>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
