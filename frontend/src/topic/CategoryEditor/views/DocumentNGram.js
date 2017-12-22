import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    LoadingAnimation,
    ListView,
} from '../../../public/components/View';

import styles from './styles.scss';

const propTypes = {
    ngrams: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool.isRequired,
};

const defaultProps = {
};

@CSSModules(styles, { allowMultiple: true })
export default class DocumentNGram extends React.PureComponent {
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
            {i + 1}
        </button>
    )

    getNGram = (key, keyword, i) => (
        <div
            className={styles.ngram}
            key={keyword[0]}
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData(
                    'text',
                    JSON.stringify({
                        n: i,
                        keyword: keyword[0],
                    }),
                );
                e.dataTransfer.dropEffect = 'copy';
            }}
        >
            <span
                className={styles.title}
            >
                { keyword[0] }
            </span>
            <span
                className={styles.strength}
            >
                { keyword[1] }
            </span>
        </div>
    )

    handleNGramSelectButtonClick = (i) => {
        this.setState({
            selectedNGramIndex: i,
        });
    }

    render() {
        const {
            ngrams,
            pending,
        } = this.props;

        if (pending) {
            return <LoadingAnimation />;
        }

        const {
            selectedNGramIndex,
        } = this.state;

        const ngramKeys = Object.keys(ngrams);
        ngramKeys.sort();

        const selectedNGram = ngrams[ngramKeys[selectedNGramIndex]];

        return (
            <div
                styleName="ngrams-tab"
            >
                <ListView
                    styleName="ngram-list"
                    data={selectedNGram}
                    modifier={this.getNGram}
                    keyExtractor={d => d}
                />
                <div
                    styleName="ngram-selects"
                >
                    <h4
                        styleName="heading"
                    >
                        Number of words:
                    </h4>
                    <ListView
                        styleName="ngram-select-list"
                        data={ngramKeys}
                        modifier={this.getNGramSelect}
                        keyExtractor={d => d}
                    />
                </div>
            </div>
        );
    }
}
