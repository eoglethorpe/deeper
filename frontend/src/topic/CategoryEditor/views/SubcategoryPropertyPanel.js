import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { bound } from '../../../public/utils/common';
import {
    PrimaryButton,
    DangerButton,
} from '../../../public/components/Action';
import {
    ListView,
} from '../../../public/components/View';
import {
    TextInput,
    TextArea,
} from '../../../public/components/Input';

import {
    selectedSubcategorySelector,
    updateSelectedSubcategoryAction,
    removeSelectedSubcategoryAction,
    removeSubcategoryNGramAction,
} from '../../../common/redux';

import NGram from './NGram';
import styles from './styles.scss';

const propTypes = {
    subcategory: PropTypes.shape({ id: PropTypes.string }),
    updateSelectedSubcategory: PropTypes.func.isRequired,
    removeSelectedSubcategory: PropTypes.func.isRequired,
    removeSubcategoryNGram: PropTypes.func.isRequired,
};

const defaultProps = {
    subcategory: undefined,
};

const mapStateToProps = state => ({
    subcategory: selectedSubcategorySelector(state),
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

    constructor(props) {
        super(props);

        const { subcategory } = this.props;
        const ngramKeys = Object.keys(subcategory.ngrams).filter(
            key => subcategory.ngrams[key].length > 0,
        );
        this.state = {
            selectedNGramIndex: 0,
            ngramKeys,
        };
    }

    componentWillReceiveProps(nextProps) {
        const { subcategory: oldSubcategory } = this.props;
        const { subcategory: newSubcategory } = nextProps;
        if (oldSubcategory !== newSubcategory && oldSubcategory.ngram !== newSubcategory.ngrams) {
            const ngramKeys = Object.keys(newSubcategory.ngrams).filter(
                key => newSubcategory.ngrams[key].length > 0,
            );
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
        this.setState({
            selectedNGramIndex: i,
        });
    }

    handleSubcategoryTitleInputChange = (value) => {
        const {
            subcategory,
            updateSelectedSubcategory,
        } = this.props;

        updateSelectedSubcategory({
            ...subcategory,
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
            description: value,
        });
    };

    handleSubcategoryRemove = () => {
        this.props.removeSelectedSubcategory();
    };

    handleNgramRemove = (ngram) => {
        this.props.removeSubcategoryNGram(ngram);
    }

    renderNGramSelect = (key, data, i) => (
        <button
            className={this.getNGramSelectStyleName(i)}
            key={key}
            onClick={() => { this.handleNGramSelectButtonClick(i); }}
        >
            {+key}
        </button>
    )

    render() {
        const { subcategory } = this.props;
        const {
            selectedNGramIndex,
            ngramKeys,
        } = this.state;

        if (!subcategory) {
            return (
                <div styleName="property-panel">
                    <p styleName="empty">Such empty</p>
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
                        Subcategory details
                    </h3>
                    <div styleName="action-buttons">
                        <DangerButton
                            onClick={this.handleSubcategoryRemove}
                        >
                            Remove
                        </DangerButton>
                    </div>
                </header>
                <section styleName="properties" >
                    <TextInput
                        label="Title"
                        placeholder="eg: Wash"
                        value={title}
                        onChange={this.handleSubcategoryTitleInputChange}
                    />
                    <TextArea
                        label="Description"
                        placeholder="Description of the subcategory"
                        value={description}
                        onChange={this.handleSubcategoryDescriptionInputChange}
                    />
                </section>
                <section styleName="ngrams" >
                    <div styleName="ngram-selects">
                        {
                            (ngramKeys.length > 0) && (
                                <h4 styleName="heading">
                                    Number of words:
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
                                No words yet.
                            </div>
                        )
                    }
                    <div styleName="action-buttons">
                        <PrimaryButton disabled >
                            Add word manually
                        </PrimaryButton>
                    </div>
                </section>
            </div>
        );
    }
}
