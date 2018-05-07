import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import LoadingAnimation from '../../../../../src/vendor/react-store/components/View/LoadingAnimation';
import Table from '../../../../vendor/react-store/components/View/Table';
import FormattedDate from '../../../../vendor/react-store/components/View/FormattedDate';
import Checkbox from '../../../../vendor/react-store/components/Input/Checkbox';
import {
    addLeadViewConnectorLeadsSelector,

    addLeadViewSetConnectorLeadsAction,
    setConnectorLeadSelectionAction,
} from '../../../../redux';
import _ts from '../../../../ts';

import ConnectorLeadsGetRequest from '../../requests/ConnectorLeadsGetRequest';
import styles from './styles.scss';

const propTypes = {
    connectorLeads: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    connectorId: PropTypes.number.isRequired,
    setConnectorLeads: PropTypes.func.isRequired,
    setConnectorLeadSelection: PropTypes.func.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    connectorLeads: [],
};

const mapStateToProps = (state, props) => ({
    connectorLeads: addLeadViewConnectorLeadsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setConnectorLeads: params => dispatch(addLeadViewSetConnectorLeadsAction(params)),
    setConnectorLeadSelection: params => dispatch(setConnectorLeadSelectionAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ConnectorContent extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static leadKeySelector = l => l.key;

    constructor(props) {
        super(props);

        this.state = {
            connectorLeadsLoading: true,
        };

        this.connectorLeadsHeader = [
            {
                key: 'selected',
                label: _ts('leads', 'selectLabel'),
                order: 1,
                modifier: row => (
                    <Checkbox
                        key="checkbox"
                        label={_ts('export', 'selectLabel')}
                        value={row.isSelected}
                        onChange={() => this.props.setConnectorLeadSelection({
                            key: row.key,
                            isSelected: !row.isSelected,
                            connectorId: this.props.connectorId,
                        })}
                    />
                ),
            },
            {
                key: 'title',
                label: _ts('leads', 'titleLabel'),
                order: 2,
            },
            {
                key: 'publishedOn',
                label: _ts('leads', 'datePublishedLabel'),
                order: 3,
                modifier: row => (
                    <FormattedDate
                        date={row.publishedOn}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
        ];
    }

    componentWillMount() {
        if (this.props.connectorId) {
            this.startConnectorLeadsGetRequest(this.props.connectorId);
        }
    }

    componentWillUnmount() {
        if (this.requestForConnectorLeads) {
            this.requestForConnectorLeads.stop();
        }
    }

    startConnectorLeadsGetRequest = (connectorId) => {
        if (this.requestForConnectorLeads) {
            this.requestForConnectorLeads.stop();
        }
        const requestForConnectorLeads = new ConnectorLeadsGetRequest({
            setState: v => this.setState(v),
            setConnectorLeads: this.props.setConnectorLeads,
        });
        this.requestForConnectorLeads = requestForConnectorLeads.create(connectorId);
        this.requestForConnectorLeads.start();
    }

    render() {
        const {
            connectorLeads = [],
            className,
        } = this.props;
        const { connectorLeadsLoading } = this.state;

        const classNames = `${styles.connectorContent} ${className}`;
        return (
            <div className={classNames} >
                { connectorLeadsLoading && <LoadingAnimation large /> }
                <Table
                    data={connectorLeads}
                    headers={this.connectorLeadsHeader}
                    keyExtractor={ConnectorContent.leadKeySelector}
                />
            </div>
        );
    }
}
