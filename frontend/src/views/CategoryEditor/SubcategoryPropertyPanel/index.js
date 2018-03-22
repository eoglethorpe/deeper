import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { bound } from '../../../vendor/react-store/utils/common';
import ListView from '../../../vendor/react-store/components/View/List/ListView';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';
import TextArea from '../../../vendor/react-store/components/Input/TextArea';
import Confirm from '../../../vendor/react-store/components/View/Modal/Confirm';

import {
    selectedSubcategorySelector,
    updateSelectedSubcategoryAction,
    removeSelectedSubcategoryAction,
    removeSubcategoryNGramAction,
    ceIdFromRouteSelector,
    ceStringsSelector,
} from '../../../redux';

import NGram from './NGram';
import styles from '../styles.scss';

const propTypes = {
    subcategory: PropTypes.shape({ id: PropTypes.string }),
    updateSelectedSubcategory: PropTypes.func.isRequired,
    removeSelectedSubcategory: PropTypes.func.isRequired,
    removeSubcategoryNGram: PropTypes.func.isRequired,
    onNewManualNGram: PropTypes.func.isRequired,
    categoryEditorId: PropTypes.number.isRequired,
    ceStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    subcategory: undefined,
};

const mapStateToProps = (state, props) => ({
    subcategory: selectedSubcategorySelector(state, props),
    categoryEditorId: ceIdFromRouteSelector(state, props),
    ceStrings: ceStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    updateSelectedSubcategory: params => dispatch(updateSelectedSubcategoryAction(params)),
    removeSelectedSubcategory: params => dispatch(removeSelectedSubcategoryAction(params)),
    removeSubcategoryNGram: params => dispatch(removeSubcategoryNGramAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class SubcategoryPropertyPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getNgramKeys = (subcategory) => {
        if (!subcategory) {
            return [];
        }
        return Object.keys(subcategory.ngrams).filter(
            key => subcategory.ngrams[key].length > 0,
        );
    }

    constructor(props) {
        super(props);

        const { subcategory } = this.props;
        const ngramKeys = SubcategoryPropertyPanel.getNgramKeys(subcategory);
        this.state = {
            selectedNGramIndex: 0,
            ngramKeys,

            confirmText: '',
            deleteSubCategory: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        const { subcategory: oldSubcategory } = this.props;
        const { subcategory: newSubcategory } = nextProps;

        if (oldSubcategory !== newSubcategory &&
            (!oldSubcategory || !newSubcategory ||
                oldSubcategory.ngram !== newSubcategory.ngrams)
        ) {
            const ngramKeys = SubcategoryPropertyPanel.getNgramKeys(newSubcategory);
            const selectedNGramIndex = bound(
                this.state.selectedNGramIndex,
                ngramKeys.length - 1,
                0,
            );
            this.setState({
                ngramKeys,
                selectedNGramIndex,
            });
        }
    }

    getNGramSelectStyleName = (i) => {
        const { selectedNGramIndex } = this.state;

        const styleNames = [];
        styleNames.push(styles.ngramSelect);

        if (selectedNGramIndex === i) {
            styleNames.push(styles.active);
        }

        return styleNames.join(' ');
    }

    handleNGramSelectButtonClick = (i) => {
        this.setState({ selectedNGramIndex: i });
    }

    handleSubcategoryTitleInputChange = (value) => {
        const {
            subcategory,
            updateSelectedSubcategory,
        } = this.props;

        updateSelectedSubcategory({
            ...subcategory,
            categoryEditorId: this.props.categoryEditorId,
            title: value,
        });
    };

    handleSubcategoryDescriptionInputChange = (value) => {
        const {
            subcategory,
            updateSelectedSubcategory,
        } = this.props;

        updateSelectedSubcategory({
            ...subcategory,
            categoryEditorId: this.props.categoryEditorId,
            description: value,
        });
    };

    handleSubcategoryRemove = () => {
        const { subcategory } = this.props;
        // const activeSubCategory = subcategory.find(cat => cat.id === activeSubCategoryId);
        const confirmText = `${this.props.ceStrings('confirmTextDeleteSubCategory')} ${subcategory.title} ?`;

        this.setState({
            deleteSubCategory: true,
            confirmText,
        });
    };

    // Close Delete Modal
    handleRemoveSubCategoryClose = (confirm) => {
        if (confirm) {
            this.props.removeSelectedSubcategory({
                categoryEditorId: this.props.categoryEditorId,
            });
        }
        this.setState({ deleteSubCategory: false });
    }

    handleNgramRemove = (ngram) => {
        this.props.removeSubcategoryNGram({
            categoryEditorId: this.props.categoryEditorId,
            ngram,
        });
    }

    handleDelete = (keyword) => {
        const { ngramKeys, selectedNGramIndex } = this.state;
        const n = ngramKeys[selectedNGramIndex];
        this.handleNgramRemove({ n, keyword });
    }

    renderNGramSelect = (key, data, i) => (
        <button
            className={this.getNGramSelectStyleName(i)}
            key={key}
            onClick={() => { this.handleNGramSelectButtonClick(i); }}
        >
            {key}
        </button>
    )

    render() {
        const {
            subcategory,
            onNewManualNGram,
        } = this.props;
        const {
            selectedNGramIndex,
            ngramKeys,
            deleteSubCategory,
            confirmText,
        } = this.state;

        if (!subcategory) {
            return (
                <div className={styles.propertyPanel}>
                    <p className={styles.empty}>
                        {this.props.ceStrings('nothingHereText')}
                    </p>
                </div>
            );
        }

        const {
            ngrams,
            title,
            description,
        } = subcategory;

        const keywords = ngrams[ngramKeys[selectedNGramIndex]];

        return (
            <div
                className={styles.propertyPanel}
            >
                <header className={styles.header} >
                    <h3 className={styles.heading} >
                        {this.props.ceStrings('subCategoryDetailsText')}
                    </h3>
                    <div className={styles.actionButtons}>
                        <DangerButton
                            onClick={this.handleSubcategoryRemove}
                        >
                            {this.props.ceStrings('removeCategoryButtonLabel')}
                        </DangerButton>
                    </div>
                </header>
                <section className={styles.properties} >
                    <TextInput
                        label={this.props.ceStrings('subCategoryTitleLabel')}
                        placeholder={this.props.ceStrings('subCategoryTitlePlaceholder')}
                        value={title}
                        onChange={this.handleSubcategoryTitleInputChange}
                    />
                    <TextArea
                        label={this.props.ceStrings('subCategoryDescriptionLabel')}
                        placeholder={this.props.ceStrings('subCategoryDescriptionPlaceholder')}
                        value={description}
                        onChange={this.handleSubcategoryDescriptionInputChange}
                    />
                </section>
                <section className={styles.ngrams} >
                    <div className={styles.ngramSelects}>
                        {
                            (ngramKeys.length > 0) && (
                                <h4 className={styles.heading}>
                                    {this.props.ceStrings('numberOfWordsLabel')}
                                </h4>
                            )
                        }
                        <ListView
                            className={styles.ngramSelectList}
                            data={ngramKeys}
                            modifier={this.renderNGramSelect}
                            keyExtractor={d => d}
                            emptyComponent={null}
                        />
                    </div>
                    {
                        (ngramKeys.length > 0) ? (
                            <NGram
                                keywords={keywords}
                                onDelete={this.handleDelete}
                            />
                        ) : (
                            <div className={styles.empty}>
                                {this.props.ceStrings('noWordsText')}
                            </div>
                        )
                    }
                    <div className={styles.actionButtons}>
                        <PrimaryButton
                            onClick={onNewManualNGram}
                        >
                            {this.props.ceStrings('addWordManuallyButtonLabel')}
                        </PrimaryButton>
                    </div>
                </section>
                <Confirm
                    onClose={this.handleRemoveSubCategoryClose}
                    show={deleteSubCategory}
                >
                    <p>{confirmText}</p>
                </Confirm>
            </div>
        );
    }
}
