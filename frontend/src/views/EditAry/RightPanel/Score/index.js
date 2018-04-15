import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import styles from './styles.scss';

const propTypes = {
};
const defaultProps = {
};

export default class Score extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const className = styles.score;
        return className;
    }

    render() {
        const className = this.getClassName();

        return (
            <div className={className}>
                Score
            </div>
        );
    }
}

