import React from 'react';

import BoundError from '../../vendor/react-store/components/General/BoundError';
import AppError from '../../components/AppError';

const propTypes = {
};

const defaultProps = {
    leads: [],
};

@BoundError(AppError)
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
