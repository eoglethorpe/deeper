import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import {
    SelectInput,
    TextInput,
    requiredCondition,
    Form,
    NonFieldErrors,
} from '../../../public/components/Input';
import {
    Modal,
    ModalBody,
    ModalHeader,
    LoadingAnimation,
} from '../../../public/components/View';
import { randomString } from '../../../public/utils/common';
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
            activeCategory: 1,
            formErrors: [],
            formFieldErrors: {},
            formValues: [],
            pending: false,
            stale: false,
        };

        this.elements = [
            'label',
            'description',
            'owner',
        ];

        this.validations = {
            label: [requiredCondition],
            description: [requiredCondition],
            owner: [requiredCondition],
        };
    }

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
        this.setState({
            activeCategory: key,
        });
    }

    // FORM RELATED

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
    render() {
        const cat = this.state.categoryData.find(
            d => d.key === this.state.activeCategory,
        );
        const {
            addNewCategory,
            activeCategory,
            formFieldErrors,
            formValues,
            pending,
            stale,
            formErrors = [],
        } = this.state;
        return (
            <div styleName={this.props.className}>
                <div styleName="header">
                    <div styleName="search-category">
                        <SelectInput
                            placeholder="Select a Category"
                            label="Category"
                            showHintAndError={false}
                            options={this.state.categoryData}
                            value={activeCategory}
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
                <h2>
                    {cat.label}
                </h2>
                <Categories />
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
            </div>
        );
    }
}
