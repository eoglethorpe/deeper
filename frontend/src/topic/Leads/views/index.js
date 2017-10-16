import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import EditLeadForm from '../components/EditLeadForm';
import FormattedDate from '../../../public/components/FormattedDate';
import RawTable from '../../../public/components/RawTable';
import browserHistory from '../../../common/browserHistory';
import Table from '../../../public/components/Table';
import styles from './styles.scss';
import Modal, { Header, Body } from '../../../public/components/Modal';
import { pageTitles } from '../../../common/utils/labels';
import Button, { PrimaryButton } from '../../../public/components/Button';
import {
    leadsSelector,
} from '../../../common/selectors/domainData';
import {
    setNavbarStateAction,
} from '../../../common/action-creators/navbar';

const propTypes = {
    leads: PropTypes.array, // eslint-disable-line
    setNavbarState: PropTypes.func.isRequired,
};

const defaultProps = {
    leads: [],
};

const mapStateToProps = state => ({
    state,
    leads: leadsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
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
                modifier: row => <FormattedDate date={row.createdOn} mode="dd-MM-yyyy hh:mm" />,
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
                modifier: row => <FormattedDate date={row.published} />,
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

    componentWillMount() {
        console.log('Mounting Leads');

        this.props.setNavbarState({
            visible: true,
            activeLink: pageTitles.leads,
            validLinks: [
                pageTitles.leads,
                pageTitles.entries,
                pageTitles.ary,
                pageTitles.weeklySnapshot,
                pageTitles.export,

                pageTitles.userProfile,
                pageTitles.adminPanel,
                pageTitles.countryPanel,
                pageTitles.projectPanel,
            ],
        });
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

    leadKeyExtractor = lead => (lead.id.toString())

    leadModifier = (lead, columnKey) => {
        const header = this.headers.find(d => d.key === columnKey);

        if (header.modifier) {
            return header.modifier(lead);
        }

        return lead[columnKey];
    }

    handleAddLeadClick = () => {
        browserHistory.push('/:projectId/leads/new/');
    }


    render() {
        console.log('Rendering Leads');

        return (
            <div styleName="leads">
                <Helmet>
                    <title>
                        { pageTitles.leads }
                    </title>
                </Helmet>
                <header styleName="header">
                    <h1>{ pageTitles.leads }</h1>
                    <PrimaryButton
                        onClick={() => this.handleAddLeadClick()}
                    >
                    Add lead
                    </PrimaryButton>
                </header>
                <div styleName="filters">
                    Filters
                </div>
                <div styleName="table-container">
                    <RawTable
                        styleName="leads-table"
                        data={this.props.leads}
                        headers={this.headers}
                        keyExtractor={this.leadKeyExtractor}
                        dataModifier={this.leadModifier}
                    />
                </div>
                <footer styleName="footer">
                    Footer
                </footer>
                <Modal
                    closeOnEscape
                    onClose={this.handleEditLeadModalClose}
                    show={this.state.showEditLeadModal}
                >
                    <Header
                        title="Edit lead"
                    />
                    <Body>
                        <EditLeadForm
                            onSubmit={() => {}}
                            pending={false}
                            values={this.state.editRow}
                        />
                    </Body>
                </Modal>
            </div>
        );
    }
}
