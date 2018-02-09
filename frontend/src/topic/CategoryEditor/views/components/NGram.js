import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import ListView from '../../../../public/components/View/List/ListView';
import DangerButton from '../../../../public/components/Action/Button/DangerButton';

import { iconNames } from '../../../../common/constants';

import styles from '../styles.scss';

const propTypes = {
    keywords: PropTypes.arrayOf(PropTypes.string),
    onDelete: PropTypes.func.isRequired,
};

const defaultProps = {
    keywords: [],
};

@CSSModules(styles, { allowMultiple: true })
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
            <div className={styles['action-buttons']}>
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
        const { keywords } = this.props;

        return (
            <ListView
                styleName="ngram"
                data={keywords}
                modifier={this.renderKeyword}
                keyExtractor={this.keyExtractorForKeyword}
            />
        );
    }
}
