import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Helmet from 'react-helmet';
import EditLeadForm from '../components/EditLeadForm';
import Table from '../../../public/components/Table';
import Modal, { Header, Body } from '../../../public/components/Modal';
import { pageTitles } from '../../../common/utils/labels';
import Button, { PrimaryButton } from '../../../public/components/Button';
import styles from './styles.scss';
import {
    leadsSelector,
} from '../../../common/selectors/domainData';

const propTypes = {
    leads: PropTypes.array, // eslint-disable-line
};

const defaultProps = {
    leads: [],
};

const mapStateToProps = state => ({
    state,
    leads: leadsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    dispatch,
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Leads extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.headers = [
            {
                key: 'createdOn',
                label: 'Created on',
                order: 1,
            },
            {
                key: 'createdBy',
                label: 'Created by',
                order: 2,
            },
            {
                key: 'title',
                label: 'Title',
                order: 3,
            },
            {
                key: 'published',
                label: 'Published',
                order: 4,
            },
            {
                key: 'confidentiality',
                label: 'Confidentiality',
                order: 5,
            },
            {
                key: 'source',
                label: 'Source',
                order: 6,
            },
            {
                key: 'numberOfEntries',
                label: 'No. of entries',
                order: 7,
            },
            {
                key: 'status',
                label: 'Status',
                order: 8,
            },
            {
                key: 'actions',
                label: 'Actions',
                order: 9,
                modifier: row => (
                    <div className="actions">
                        <Button
                            onClick={() => this.handleEditLeadClick(row)}
                        >
                            <i className="ion-edit" />
                        </Button>
                        <Button>
                            <i className="ion-forward" />
                        </Button>
                    </div>
                ),
            },
        ];

        this.state = {
            editRow: {},
            showEditLeadModal: false,
        };
    }

    handleEditLeadClick = (row) => {
        this.setState({
            editRow: row,
            showEditLeadModal: true,
        });
    }

    handleEditLeadModalClose = () => {
        this.setState({
            // editRow: {},
            showEditLeadModal: false,
        });
    }

    render() {
        return (
            <div styleName="leads">
                <Helmet>
                    <title>{ pageTitles.leads }</title>
                </Helmet>
                <header styleName="header">
                    <h1>{ pageTitles.leads }</h1>
                    <PrimaryButton>Add lead</PrimaryButton>
                </header>
                <div styleName="filters">
                    Filters
                </div>
                <div styleName="table-container">
                    <Table
                        headers={this.headers}
                        data={this.props.leads}
                    />
                </div>
                <footer styleName="footer">
                    Footer
                </footer>
                <Modal
                    show={this.state.showEditLeadModal}
                    onClose={this.handleEditLeadModalClose}
                    closeOnEscape
                >
                    <Header
                        title="Edit lead"
                    />
                    <Body>
                        <EditLeadForm
                            onSubmit={() => {}}
                            values={this.state.editRow}
                            pending={false}
                        />
                    </Body>
                </Modal>
            </div>
        );
    }
}
