import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import BoundError from '../../vendor/react-store/components/General/BoundError';
import AppError from '../../components/AppError';
import {
    connectorStringsSelector,
} from '../../redux';

import styles from './styles.scss';

const propTypes = {
    connectorStrings: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    connectorStrings: connectorStringsSelector(state),
});

@BoundError(AppError)
@connect(mapStateToProps, undefined)
export default class Connector extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        return (
            <div className={styles.connectors}>
                <div className={styles.sidebar}>
                    {this.props.connectorStrings('headerConnectors')}
                </div>
            </div>
        );
    }
}
