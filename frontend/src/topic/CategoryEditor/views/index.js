import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    TextInput,
    SelectInput,
} from '../../../public/components/Input';

import {
    Button,
    PrimaryButton,
} from '../../../public/components/Action';

import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '../../../public/components/View';

import {
    randomString,
} from '../../../public/utils/common';

import DocumentPanel from './DocumentPanel';
import SubcategoryColumn from './SubcategoryColumn';
import SubcategoryPropertyPanel from './SubcategoryPropertyPanel';

import {
    categoriesSelector,
    activeCategoryIdSelector,
    addNewCategoryAction,
    setActiveCategoryIdAction,
    addNewSubcategoryAction,
    updateSelectedSubcategoriesAction,
    addSubcategoryNGramAction,
} from '../../../common/redux';

import styles from './styles.scss';

const mapStateToProps = state => ({
    categories: categoriesSelector(state),
    activeCategoryId: activeCategoryIdSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addNewCategory: params => dispatch(addNewCategoryAction(params)),
    setActiveCategoryId: params => dispatch(setActiveCategoryIdAction(params)),
    addNewSubcategory: params => dispatch(addNewSubcategoryAction(params)),
    updateSelectedSubcategories: params => dispatch(updateSelectedSubcategoriesAction(params)),
    addSubcategoryNGram: params => dispatch(addSubcategoryNGramAction(params)),
});

const propTypes = {
    categories: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    activeCategoryId: PropTypes.string,
    addNewCategory: PropTypes.func.isRequired,
    setActiveCategoryId: PropTypes.func.isRequired,
    addNewSubcategory: PropTypes.func.isRequired,
    updateSelectedSubcategories: PropTypes.func.isRequired,
    addSubcategoryNGram: PropTypes.func.isRequired,
};

const defaultProps = {
    activeCategoryId: undefined,
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
            showCategoryTitleModal: false,
            newCategoryTitleInputValue: '',
            showSubcategoryTitleModal: false,
            newSubcategoryTitleInputValue: '',
        };
    }

    getSubcategoryColumns = () => {
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

    handleSubcategoryDrop = (level, subcategoryId, data) => {
        const { addSubcategoryNGram } = this.props;
        try {
            const ngram = JSON.parse(data);
            addSubcategoryNGram({
                level,
                subcategoryId,
                ngram,
            });
        } catch (ex) {
            console.warn('Drop element is not valid');
        }
    }

    handleNewSubcategory = (level) => {
        this.newSubcategoryLevel = level;
        this.setState({ showSubcategoryTitleModal: true });
    }

    handleSubcategoryClick = (level, subcategoryId) => {
        const { updateSelectedSubcategories } = this.props;
        updateSelectedSubcategories({ level, subcategoryId });
    }

    addNewSubcategory = (title) => {
        const { newSubcategoryLevel: level } = this;
        const { addNewSubcategory } = this.props;
        const id = randomString();
        addNewSubcategory({ level, id, title });
    }

    addNewCategory = (title) => {
        const key = randomString();
        const newCategory = {
            id: key,
            title,
        };
        this.props.addNewCategory(newCategory);
    }

    handleCategorySelectChange = (value) => {
        const { setActiveCategoryId } = this.props;
        setActiveCategoryId(value);
    }

    handleAddCategoryButtonClick = () => {
        this.setState({ showCategoryTitleModal: true });
    }

    handlePropertyAddSubcategoryButtonClick = () => {
        this.addNewSubcategoryInActiveSubcategory();
    }

    handleNameModalClose = () => {
        this.setState({
            showCategoryTitleModal: false,
            showSubategoryTitleModal: false,
        });
    }

    handleNameModalCancelButtonClick = () => {
        this.setState({
            showCategoryTitleModal: false,
            showSubcategoryTitleModal: false,
            newCategoryTitleInputValue: '',
            newSubcategoryTitleInputValue: '',
        });
    }

    handleNewCategoryTitleInputValueChange = (value) => {
        this.setState({ newCategoryTitleInputValue: value });
    }

    handleCategoryTitleModalOkButtonClick = () => {
        this.addNewCategory(this.state.newCategoryTitleInputValue);

        this.setState({
            showCategoryTitleModal: false,
            newCategoryTitleInputValue: '',
        });
    }

    handleNewSubcategoryTitleInputValueChange = (value) => {
        this.setState({ newSubcategoryTitleInputValue: value });
    }

    handleSubcategoryTitleModalOkButtonClick = () => {
        this.addNewSubcategory(this.state.newSubcategoryTitleInputValue);

        this.setState({
            showSubcategoryTitleModal: false,
            newSubcategoryTitleInputValue: '',
        });
    }

    render() {
        const {
            categories,
            activeCategoryId,
        } = this.props;
        const {
            showCategoryTitleModal,
            newCategoryTitleInputValue,
            showSubcategoryTitleModal,
            newSubcategoryTitleInputValue,
        } = this.state;

        return (
            <div styleName="category-editor">
                <div styleName="left">
                    <DocumentPanel />
                </div>
                <div styleName="right">
                    <header styleName="header">
                        <SelectInput
                            styleName="category-select"
                            options={categories}
                            onChange={this.handleCategorySelectChange}
                            placeholder="Select category"
                            showLabel={false}
                            showHintAndError={false}
                            value={activeCategoryId}
                            keySelector={d => d.id}
                            labelSelector={d => d.title}
                        />
                        <Button onClick={this.handleAddCategoryButtonClick}>
                            Add category
                        </Button>
                    </header>
                    <div styleName="content">
                        <div styleName="sub-categories">
                            {
                                activeCategoryId ? (
                                    this.getSubcategoryColumns()
                                ) : (
                                    <p styleName="empty">
                                        Such empty
                                    </p>
                                )
                            }
                        </div>
                        <SubcategoryPropertyPanel />
                    </div>
                </div>
                <Modal
                    styleName="new-category-modal"
                    show={showCategoryTitleModal}
                    onClose={this.handleNameModalClose}
                >
                    <ModalHeader title="Add new category" />
                    <ModalBody>
                        <TextInput
                            label="Title"
                            placeholder="eg: Sector"
                            onChange={this.handleNewCategoryTitleInputValueChange}
                            value={newCategoryTitleInputValue}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            onClick={this.handleNameModalCancelButtonClick}
                        >
                            Cancel
                        </Button>
                        <PrimaryButton
                            onClick={this.handleCategoryTitleModalOkButtonClick}
                            styleName="ok-button"
                        >
                            Ok
                        </PrimaryButton>
                    </ModalFooter>
                </Modal>
                <Modal
                    styleName="new-subcategory-modal"
                    show={showSubcategoryTitleModal}
                    onClose={this.handleNameModalClose}
                >
                    <ModalHeader title="Add new subcategory" />
                    <ModalBody>
                        <TextInput
                            label="Title"
                            placeholder="eg: Wash"
                            onChange={this.handleNewSubcategoryTitleInputValueChange}
                            value={newSubcategoryTitleInputValue}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={this.handleNameModalCancelButtonClick}>
                            Cancel
                        </Button>
                        <PrimaryButton
                            onClick={this.handleSubcategoryTitleModalOkButtonClick}
                            styleName="ok-button"
                        >
                            Ok
                        </PrimaryButton>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
