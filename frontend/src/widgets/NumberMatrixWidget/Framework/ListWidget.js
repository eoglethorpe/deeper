import React from 'react';

import BoundError from '../../../vendor/react-store/components/General/BoundError';

import WidgetError from '../../../components/WidgetError';
import _ts from '../../../ts';

import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
};

@BoundError(WidgetError)
export default class NumberMatrixList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const contentText = _ts('af', 'numberMatrixWidgetLabel');

        return (
            <div className={styles.list}>
                { contentText }
            </div>
        );
    }
}
