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

import List from '../../../src/vendor/react-store/components/View/List';

import styles from './styles.scss';

const propTypes = {
    connectorStrings: PropTypes.func.isRequired,
    setUserConnectors: PropTypes.func.isRequired,
    connectors: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
    connectorStrings: connectorStringsSelector(state),
    connectors: connectorsSelector(state),
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

    renderConnectorListItem = (k, data) => (
        <div key={data.id}>
            { (data.formValues || {}).title }
        </div>
    )

    render() {
        const {
            connectors,
            connectorStrings,
        } = this.props;

        const connectorsList = Object.values(connectors);

        return (
            <div className={styles.connectors}>
                <div className={styles.sidebar}>
                    {connectorStrings('headerConnectors')}
                    <List
                        data={connectorsList}
                        modifier={this.renderConnectorListItem}
                    />
                </div>
            </div>
        );
    }
}
