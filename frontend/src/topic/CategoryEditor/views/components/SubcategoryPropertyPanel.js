import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { bound } from '../../../../public/utils/common';
import {
    PrimaryButton,
    DangerButton,
} from '../../../../public/components/Action';
import {
    TextInput,
    TextArea,
} from '../../../../public/components/Input';
import {
    ListView,
    Confirm,
} from '../../../../public/components/View';

import {
    ceStrings,
} from '../../../../common/constants';

import {
    selectedSubcategorySelector,
    updateSelectedSubcategoryAction,
    removeSelectedSubcategoryAction,
    removeSubcategoryNGramAction,
    ceIdFromRouteSelector,
} from '../../../../common/redux';

import NGram from './NGram';
import styles from '../styles.scss';

const propTypes = {
    subcategory: PropTypes.shape({ id: PropTypes.string }),
    updateSelectedSubcategory: PropTypes.func.isRequired,
    removeSelectedSubcategory: PropTypes.func.isRequired,
    removeSubcategoryNGram: PropTypes.func.isRequired,
    onNewManualNGram: PropTypes.func.isRequired,
    categoryEditorId: PropTypes.number.isRequired,
};

const defaultProps = {
    subcategory: undefined,
};

const mapStateToProps = (state, props) => ({
    subcategory: selectedSubcategorySelector(state, props),
    categoryEditorId: ceIdFromRouteSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    updateSelectedSubcategory: params => dispatch(updateSelectedSubcategoryAction(params)),
    removeSelectedSubcategory: params => dispatch(removeSelectedSubcategoryAction(params)),
    removeSubcategoryNGram: params => dispatch(removeSubcategoryNGramAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
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
        styleNames.push(styles['ngram-select']);

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
        const confirmText = `${ceStrings.confirmTextDeleteSubCategory} ${subcategory.title} ?`;

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
                <div styleName="property-panel">
                    <p styleName="empty">{ceStrings.nothingHereText}</p>
                </div>
            );
        }

        const {
            ngrams,
            title,
            description,
        } = subcategory;

        return (
            <div
                styleName="property-panel"
            >
                <header styleName="header" >
                    <h3 styleName="heading" >
                        {ceStrings.subCategoryDetailsText}
                    </h3>
                    <div styleName="action-buttons">
                        <DangerButton
                            onClick={this.handleSubcategoryRemove}
                        >
                            {ceStrings.removeCategoryButtonLabel}
                        </DangerButton>
                    </div>
                </header>
                <section styleName="properties" >
                    <TextInput
                        label={ceStrings.subCategoryTitleLabel}
                        placeholder={ceStrings.subCategoryTitlePlaceholder}
                        value={title}
                        onChange={this.handleSubcategoryTitleInputChange}
                    />
                    <TextArea
                        label={ceStrings.subCategoryDescriptionLabel}
                        placeholder={ceStrings.subCategoryDescriptionPlaceholder}
                        value={description}
                        onChange={this.handleSubcategoryDescriptionInputChange}
                    />
                </section>
                <section styleName="ngrams" >
                    <div styleName="ngram-selects">
                        {
                            (ngramKeys.length > 0) && (
                                <h4 styleName="heading">
                                    {ceStrings.numberOfWordsLabel}
                                </h4>
                            )
                        }
                        <ListView
                            styleName="ngram-select-list"
                            data={ngramKeys}
                            modifier={this.renderNGramSelect}
                            keyExtractor={d => d}
                            emptyComponent={null}
                        />
                    </div>
                    {
                        (ngramKeys.length > 0) ? (
                            <NGram
                                keywords={ngrams[ngramKeys[selectedNGramIndex]]}
                                onDelete={keyword => this.handleNgramRemove({
                                    // TODO: fix this mess later
                                    n: ngramKeys[selectedNGramIndex],
                                    keyword,
                                })}
                            />
                        ) : (
                            <div styleName="empty">
                                {ceStrings.noWordsText}
                            </div>
                        )
                    }
                    <div styleName="action-buttons">
                        <PrimaryButton
                            onClick={onNewManualNGram}
                        >
                            {ceStrings.addWordManuallyButtonLabel}
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
