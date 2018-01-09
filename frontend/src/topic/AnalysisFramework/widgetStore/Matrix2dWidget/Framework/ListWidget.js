import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
    title: PropTypes.string.isRequired,
};

export default class Matrix2dList extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        return (
            <div>
                {this.props.title}
            </div>
        );
    }
}
