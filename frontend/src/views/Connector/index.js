import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import BoundError from '../../vendor/react-store/components/General/BoundError';
import AppError from '../../components/AppError';
import {
    connectorStringsSelector,
    connectorsSelector,

    setUserConnectorsAction,
} from '../../redux';
import ConnectorsGetRequest from './requests/ConnectorsGetRequest';

import styles from './styles.scss';

const propTypes = {
    connectorStrings: PropTypes.func.isRequired,
    setUserConnectors: PropTypes.func.isRequired,
    connectorsList: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
    connectorStrings: connectorStringsSelector(state),
    connectorsList: connectorsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserConnectors: params => dispatch(setUserConnectorsAction(params)),
});

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class Connector extends React.PureComponent {
    static propTypes = propTypes;

    componentWillMount() {
        this.startConnectorsRequest();
    }

    componentWillUnmount() {
        if (this.requestForConnectors) {
            this.requestForConnectors.stop();
        }
    }

    startConnectorsRequest = () => {
        if (this.requestForConnectors) {
            this.requestForConnectors.stop();
        }
        const requestForConnectors = new ConnectorsGetRequest({
            setState: v => this.setState(v),
            setUserConnectors: this.props.setUserConnectors,
        });
        this.requestForConnectors = requestForConnectors.create();
        this.requestForConnectors.start();
    }

    render() {
        const { connectorsList } = this.props;
        console.warn(connectorsList);
        return (
            <div className={styles.connectors}>
                <div className={styles.sidebar}>
                    {this.props.connectorStrings('headerConnectors')}
                </div>
            </div>
        );
    }
}
