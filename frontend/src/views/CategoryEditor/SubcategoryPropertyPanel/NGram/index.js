import PropTypes from 'prop-types';
import React from 'react';

import ListView from '../../../../vendor/react-store/components/View/List/ListView';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';

import { iconNames } from '../../../../constants';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    keywords: PropTypes.arrayOf(PropTypes.string),
    onDelete: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    keywords: [],
};

export default class NGram extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    keyExtractorForKeyword = keyword => keyword;

    renderKeyword = (key, data) => (
        <div
            key={key}
            className={styles.keyword}
        >
            <div className={styles.title}>
                { data }
            </div>
            <div className={styles.actionButtons}>
                <DangerButton
                    onClick={() => this.props.onDelete(data)}
                    transparent
                >
                    <span className={iconNames.delete} />
                </DangerButton>
            </div>
        </div>
    )

    render() {
        const {
            keywords,
            className,
        } = this.props;

        return (
            <ListView
                className={`${styles.ngram} ${className}`}
                data={keywords}
                modifier={this.renderKeyword}
                keyExtractor={this.keyExtractorForKeyword}
            />
        );
    }
}
