import React from 'react';

import BoundError from '../../components/BoundError';

const propTypes = {
};

const defaultProps = {
    leads: [],
};

@BoundError
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
