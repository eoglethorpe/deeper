import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    selectedSubcategorySelector,
    updateSelectedSubcategoryAction,
} from '../../../common/redux';

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

import NGram from './NGram';

import styles from './styles.scss';

const propTypes = {
    subcategory: PropTypes.shape({
        id: PropTypes.string,
    }),
    updateSelectedSubcategory: PropTypes.func.isRequired,
};

const defaultProps = {
    subcategory: undefined,
};

const mapStateToProps = state => ({
    subcategory: selectedSubcategorySelector(state),
});

const mapDispatchToProps = dispatch => ({
    updateSelectedSubcategory: params => dispatch(updateSelectedSubcategoryAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class SubcategoryPropertyPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            selectedNGramIndex: 0,
        };
    }

    getNGramSelectStyleName = (i) => {
        const {
            selectedNGramIndex,
        } = this.state;

        const styleNames = [];
        styleNames.push(styles['ngram-select']);

        if (selectedNGramIndex === i) {
            styleNames.push(styles.active);
        }

        return styleNames.join(' ');
    }

    getNGramSelect = (key, data, i) => (
        <button
            className={this.getNGramSelectStyleName(i)}
            key={key}
            onClick={() => { this.handleNGramSelectButtonClick(i); }}
        >
            {+key + 1}
        </button>
    )

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

    render() {
        const {
            subcategory,
        } = this.props;

        const {
            selectedNGramIndex,
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
        } = subcategory;

        const ngramKeys = Object.keys(ngrams);

        console.log(ngrams);

        return (
            <div
                styleName="property-panel"
            >
                <header styleName="header" >
                    <h3 styleName="heading" >
                        Subcategory details
                    </h3>
                    <div styleName="action-buttons">
                        <DangerButton disabled >
                            Remove
                        </DangerButton>
                    </div>
                </header>
                <section styleName="properties" >
                    <TextInput
                        label="Title"
                        placeholder="eg: Wash"
                        value={subcategory.title}
                        onChange={this.handleSubcategoryTitleInputChange}
                    />
                    <TextArea
                        label="Description"
                        placeholder="Description of the subcategory"
                        value={subcategory.description}
                        onChange={this.handleSubcategoryDescriptionInputChange}
                    />
                </section>
                <section styleName="ngrams" >
                    <div styleName="ngram-selects">
                        {
                            (ngramKeys.length > 0) && (
                                <h4
                                    styleName="heading"
                                >
                                    Number of words:
                                </h4>
                            )
                        }
                        <ListView
                            styleName="ngram-select-list"
                            data={ngramKeys}
                            modifier={this.getNGramSelect}
                            keyExtractor={d => d}
                        />
                    </div>
                    {
                        ngramKeys.length > 0 && (
                            <NGram
                                keywords={ngrams[ngramKeys[selectedNGramIndex]]}
                            />
                        )
                    }
                    <PrimaryButton
                        disabled
                    >
                        Add word manually
                    </PrimaryButton>
                </section>
            </div>
        );
    }
}
