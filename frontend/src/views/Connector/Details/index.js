import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    connectorStringsSelector,
    connectorsListSelector,
    connectorIdFromRouteSelector,
    notificationStringsSelector,

    setUserConnectorDetailsAction,
} from '../../../redux';

import LoadingAnimation from '../../../vendor/react-store/components/View/LoadingAnimation';
import ConnectorDetailsGetRequest from '../requests/ConnectorDetailsGetRequest';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    connectorId: PropTypes.number,
    setUserConnectorDetails: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    connectorId: undefined,
};

const mapStateToProps = state => ({
    connectorStrings: connectorStringsSelector(state),
    notificationStrings: notificationStringsSelector(state),
    connectorsList: connectorsListSelector(state),
    connectorId: connectorIdFromRouteSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserConnectorDetails: params => dispatch(setUserConnectorDetailsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ConnectorDetails extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keyExtractor = d => d;

    constructor(props) {
        super(props);

        this.state = {
            dataLoading: false,
        };
    }

    componentDidMount() {
        if (this.props.connectorId) {
            this.startConnectorDetailsRequest(this.props.connectorId);
        }
    }

    componentWillReceiveProps(nextProps) {
        const {
            connectorId: nextConnectorId,
        } = nextProps;
        const {
            connectorId: prevConnectorId,
        } = this.props;
        if (nextConnectorId && nextConnectorId !== prevConnectorId) {
            this.startConnectorDetailsRequest(nextConnectorId);
        }
    }

    componentWillUnmount() {
        if (this.requestForConnectorDetails) {
            this.requestForConnectorDetails.stop();
        }
    }

    getClassName = () => {
        const { className } = this.props;
        return `
            ${className}
            ${styles.details}
        `;
    }

    startConnectorDetailsRequest = (connectorId) => {
        if (this.requestForConnectorDetails) {
            this.requestForConnectorDetails.stop();
        }
        const requestForConnectorDetails = new ConnectorDetailsGetRequest({
            setState: v => this.setState(v),
            setUserConnectorDetails: this.props.setUserConnectorDetails,
        });
        this.requestForConnectorDetails = requestForConnectorDetails.create(connectorId);
        this.requestForConnectorDetails.start();
    }


    render() {
        const { dataLoading } = this.state;
        const { connectorId } = this.props;

        const className = this.getClassName();

        return (
            <div className={className}>
                {
                    dataLoading ? (
                        <LoadingAnimation large />
                    ) : (
                        <p>{connectorId}</p>
                    )
                }
            </div>
        );
    }
}
