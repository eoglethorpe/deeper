import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { ListView } from '../../../../public/components/View';
import { TransparentDangerButton } from '../../../../public/components/Action';

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
                <TransparentDangerButton
                    onClick={() => this.props.onDelete(data)}
                >
                    <span className={iconNames.delete} />
                </TransparentDangerButton>
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
