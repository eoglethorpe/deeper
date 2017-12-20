import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    selectedSubcategorySelector,
    updateSelectedSubcategoryAction,
} from '../../../common/redux';

import {
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
            selectedNGram: 0,
        };

        this.ngrams = [
            ['water', 'polluted'],
            ['water point', 'water quality'],
            ['lack of water'],
        ];
    }

    getNGramSelectStyleName = (i) => {
        const {
            selectedNGram,
        } = this.state;

        const styleNames = [];
        styleNames.push(styles['ngram-select']);

        if (selectedNGram === i) {
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
            n-Gram ({i + 1})
        </button>
    )

    handleNGramSelectButtonClick = (i) => {
        this.setState({
            selectedNGram: i,
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
            selectedNGram,
        } = this.state;

        const {
            ngrams,
        } = this;


        if (!subcategory) {
            return (
                <div styleName="property-panel">
                    <p styleName="empty">Such empty</p>
                </div>
            );
        }

        return (
            <div
                styleName="property-panel"
            >
                <header
                    styleName="header"
                >
                    <h3
                        styleName="heading"
                    >
                        Subcategory details
                    </h3>
                    <div styleName="action-buttons">
                        <DangerButton>
                            Remove
                        </DangerButton>
                    </div>
                </header>
                <section
                    styleName="properties"
                >
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
                <section
                    styleName="ngrams"
                >
                    <ListView
                        styleName="ngram-select-list"
                        data={ngrams}
                        modifier={this.getNGramSelect}
                        keyExtractor={d => d}
                    />
                    {
                        ngrams.length > 0 && (
                            <NGram
                                keywords={ngrams[selectedNGram]}
                            />
                        )
                    }
                </section>
            </div>
        );
    }
}
