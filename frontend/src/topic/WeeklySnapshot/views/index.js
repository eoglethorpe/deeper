import CSSModules from 'react-css-modules';
import React from 'react';

import BoundError from '../../../common/components/BoundError';

import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
    leads: [],
};

@BoundError
@CSSModules(styles, { allowMultiple: true })
export default class WeeklySnapshot extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        return (
            <div>
                Weekly snapshot
            </div>
        );
    }
}
