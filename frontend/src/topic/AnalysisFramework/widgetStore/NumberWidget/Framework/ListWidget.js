import CSSModules from 'react-css-modules';
import React from 'react';
import styles from './styles.scss';

import {
    NumberInput,
} from '../../../../../public/components/Input';

const propTypes = {
};

const defaultProps = {
};

@CSSModules(styles)
export default class NumberFrameworkList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        return (
            <div styleName="number-list">
                <NumberInput
                    styleName="number-input"
                    placeholder="999"
                    showLabel={false}
                    showHintAndError={false}
                    separator=" "
                />
            </div>
        );
    }
}
