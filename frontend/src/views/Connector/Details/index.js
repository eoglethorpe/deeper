import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import {
    connectorStringsSelector,
    connectorsListSelector,
    connectorIdFromRouteSelector,
    connectorDetailsSelector,
    connectorSourceSelector,
    notificationStringsSelector,

    setUserConnectorDetailsAction,
} from '../../../redux';

import LoadingAnimation from '../../../vendor/react-store/components/View/LoadingAnimation';
import ConnectorDetailsGetRequest from '../requests/ConnectorDetailsGetRequest';
import DetailsForm from './Form';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    connectorId: PropTypes.number,
    connectorDetails: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    setUserConnectorDetails: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    connectorDetails: {},
    connectorSource: {},
    connectorId: undefined,
};

const mapStateToProps = state => ({
    connectorStrings: connectorStringsSelector(state),
    connectorDetails: connectorDetailsSelector(state),
    connectorSource: connectorSourceSelector(state),
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

        this.state = { dataLoading: false };
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
        const { faramValues: connectorDetails = {} } = this.props.connectorDetails;
        const { connectorId } = this.props;

        const className = this.getClassName();

        return (
            <div className={className}>
                {
                    dataLoading ? (
                        <LoadingAnimation large />
                    ) : (
                        <Fragment>
                            <h3>{connectorDetails.title}</h3>
                            <DetailsForm connectorId={connectorId} />
                        </Fragment>
                    )
                }
            </div>
        );
    }
}
