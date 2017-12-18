import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    SelectInput,
} from '../../../public/components/Input';

import {
    Button,
} from '../../../public/components/Action';

import {
    randomString,
} from '../../../public/utils/common';

import SubcategoryColumn from './SubcategoryColumn';

import {
    categoriesSelector,
    activeCategoryIdSelector,
    addNewCategoryAction,
    setActiveCategoryIdAction,
    addNewSubcategoryAction,
    updateSelectedSubcategoriesAction,
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
});

const propTypes = {
    categories: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    activeCategoryId: PropTypes.string,
    addNewCategory: PropTypes.func.isRequired,
    setActiveCategoryId: PropTypes.func.isRequired,
    addNewSubcategory: PropTypes.func.isRequired,
    updateSelectedSubcategories: PropTypes.func.isRequired,
};

const defaultProps = {
    activeCategoryId: undefined,
};

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class CategoryEditor extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getSubcategoryColumns = () => {
        const {
            categories,
            activeCategoryId,
        } = this.props;

        const category = categories.find(d => d.id === activeCategoryId);
        const {
            selectedSubcategories,
        } = category;

        let subcategories = category.subcategories;

        const subcategoryColumns = selectedSubcategories.map((selected, i) => {
            const subcategoryIndex = subcategories.findIndex(d => d.id === selected);
            const currentSubcategories = subcategories;
            subcategories = currentSubcategories[subcategoryIndex].subcategories;

            return (
                <SubcategoryColumn
                    key={selected}
                    level={i}
                    selectedSubcategoryId={selected}
                    subcategories={currentSubcategories}
                    onNewSubcategory={this.handleNewSubcategory}
                    onSubcategoryClick={this.handleSubcategoryClick}
                />
            );
        });

        subcategoryColumns.push(
            <SubcategoryColumn
                level={selectedSubcategories.length}
                key="empty"
                subcategories={subcategories}
                onNewSubcategory={this.handleNewSubcategory}
                onSubcategoryClick={this.handleSubcategoryClick}
            />,
        );

        return subcategoryColumns;
    }

    handleNewSubcategory = (level) => {
        const {
            addNewSubcategory,
        } = this.props;

        const key = randomString();
        const newSubcategory = {
            id: key,
            title: `Sub category ${key}`,
            subcategories: [],
        };

        addNewSubcategory({ level, newSubcategory });
    }

    handleSubcategoryClick = (level, subCategoryId) => {
        const {
            updateSelectedSubcategories,
        } = this.props;

        updateSelectedSubcategories({ level, subCategoryId });
    }

    addNewCategory = () => {
        const key = randomString();

        const newCategory = {
            id: key,
            title: `Category ${key}`,
        };

        this.props.addNewCategory(newCategory);
    }

    handleCategorySelectChange = (value) => {
        const {
            setActiveCategoryId,
        } = this.props;

        setActiveCategoryId(value);
    }

    handleAddCategoryButtonClick = () => {
        this.addNewCategory();
    }

    handlePropertyAddSubcategoryButtonClick = () => {
        this.addNewSubcategoryInActiveSubcategory();
    }

    render() {
        const {
            categories,
            activeCategoryId,
        } = this.props;

        return (
            <div
                styleName="category-editor"
            >
                <div
                    styleName="left"
                >
                    Left
                </div>
                <div
                    styleName="right"
                >
                    <header
                        styleName="header"
                    >
                        <SelectInput
                            options={categories}
                            onChange={this.handleCategorySelectChange}
                            placeholder="Select category"
                            showLabel={false}
                            showHintAndError={false}
                            value={activeCategoryId}
                            keySelector={d => d.id}
                            labelSelector={d => d.title}
                        />
                        <Button
                            onClick={this.handleAddCategoryButtonClick}
                        >
                            Add category
                        </Button>
                    </header>
                    <div
                        styleName="content"
                    >
                        <div
                            styleName="sub-categories"
                        >
                            {
                                activeCategoryId && this.getSubcategoryColumns()
                            }
                        </div>
                        <div
                            styleName="properties"
                        >
                            properties
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
