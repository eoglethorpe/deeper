import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    Numeral,
} from '../../../../../public/components/View';

import styles from './styles.scss';

const propTypes = {
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    attribute: undefined,
};

@CSSModules(styles)
export default class NumberViewList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { attribute = {} } = this.props;
        const { value } = attribute;

        return (
            <div
                styleName="number-list"
            >
                <Numeral
                    separator=" "
                    invalidText="-"
                    showThousandSeparator
                    precision={null}
                    value={value}
                />
            </div>
        );
    }
}
