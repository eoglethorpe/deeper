import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    addLeadViewConnectorSelector,
} from '../../../../redux';

import styles from './styles.scss';

const propTypes = {
    connectorDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = (state, props) => ({
    connectorDetails: addLeadViewConnectorSelector(state, props),
});

@connect(mapStateToProps, null)
export default class ConnectorContent extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = { };
    }

    render() {
        const {
            connectorDetails,
            className,
        } = this.props;

        const classNames = `${styles.connectorContent} ${className}`;
        return (
            <div className={classNames} >
                {connectorDetails.title}
            </div>
        );
    }
}
