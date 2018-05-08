import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    trimWhitespace,
    splitInWhitespace,
} from '../../../../vendor/react-store/utils/common';
import ListView from '../../../../vendor/react-store/components/View/List/ListView';

import _ts from '../../../../ts';
import { categoryEditorNgramsSelector } from '../../../../redux';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    ngrams: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
};

const mapStateToProps = (state, props) => ({
    ngrams: categoryEditorNgramsSelector(state, props),
});


const mapDispatchToProps = dispatch => ({
    dispatch,
});


@connect(mapStateToProps, mapDispatchToProps)
export default class DocumentNGram extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = { selectedNGramIndex: 0 };
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

    handleOnDragStart = keyword => (e) => {
        const n = splitInWhitespace(keyword).length;
        const sanitizedKeyword = trimWhitespace(keyword);

        const data = JSON.stringify({
            n,
            keyword: sanitizedKeyword,
        });

        e.dataTransfer.setData('text/plain', data);
        e.dataTransfer.dropEffect = 'copy';
    }

    keyExtractorKeywordTuple = keywordTuple => keywordTuple[0];

    renderNGramSelect = (key, data, i) => (
        <button
            key={key}
            className={this.getNGramSelectStyleName(i)}
            onClick={() => this.handleNGramSelectButtonClick(i)}
        >
            {i + 1}
        </button>
    )

    renderNGram = (key, keywordTuple) => (
        <div
            className={styles.ngram}
            key={key}
            draggable
            onDragStart={this.handleOnDragStart(keywordTuple[0])}
        >
            <span className={styles.title}>
                { keywordTuple[0] }
            </span>
            <span className={styles.strength}>
                { keywordTuple[1] }
            </span>
        </div>
    )

    render() {
        const {
            className,
            ngrams,
        } = this.props;

        const { selectedNGramIndex } = this.state;

        // TODO: use selector or move to componentWillReceiveProps
        const ngramKeys = Object.keys(ngrams).sort();

        const selectedNGram = ngrams[ngramKeys[selectedNGramIndex]];

        return (
            <div className={`${styles.ngramsTab} ${className}`}>
                <ListView
                    className={styles.ngramList}
                    data={selectedNGram}
                    modifier={this.renderNGram}
                    keyExtractor={this.keyExtractorKeywordTuple}
                />
                <div className={styles.ngramSelects}>
                    <h4 className={styles.heading}>
                        {_ts('ce', 'numberOfWordsLabel')}
                    </h4>
                    <ListView
                        className={styles.ngramSelectList}
                        data={ngramKeys}
                        modifier={this.renderNGramSelect}
                        keyExtractor={this.keyExtractorKeywordTuple}
                    />
                </div>
            </div>
        );
    }
}
