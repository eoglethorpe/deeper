import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import LoadingAnimation from '../../../vendor/react-store/components/View/LoadingAnimation';
import Confirm from '../../../vendor/react-store/components/View/Modal/Confirm';
import { reverseRoute, isTruthy } from '../../../vendor/react-store/utils/common';

import { arysStringsSelector } from '../../../redux';

import { pathNames } from '../../../constants';

import AryPostRequest from '../requests/AryPostRequest';
import LeadArysGetRequest from '../requests/LeadArysGetRequest';

import styles from './styles.scss';

const propTypes = {
    projectId: PropTypes.number.isRequired,
    leadId: PropTypes.number.isRequired,

    arysStrings: PropTypes.func.isRequired,
};

const defaultProps = {};

const mapStateToProps = state => ({
    arysStrings: arysStringsSelector(state),
});

@connect(mapStateToProps, undefined)
@CSSModules(styles, { allowMultiple: true })
export default class NewAry extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            arysPending: true,
            aryCreatePending: false,

            aryId: undefined,
            redirectToProjectLeads: false,
        };
    }

    componentWillMount() {
        this.startCurrentLeadArys(this.props.leadId);
    }

    componentWillUnmount() {
        if (this.newCurrentLeadAryRequest) {
            this.newCurrentLeadAryRequest.stop();
        }
        if (this.newAryRequest) {
            this.newAryRequest.stop();
        }
    }

    getProjectLeadsLink = () =>
        reverseRoute(
            pathNames.leads,
            {
                projectId: this.props.projectId,
            },
        )


    getAryLink = (id) => {
        const {
            projectId,
            leadId,
        } = this.props;
        const aryRoute = reverseRoute(
            pathNames.editAry,
            {
                aryId: id,
                leadId,
                projectId,
            },
        );
        return aryRoute;
    }

    setArys = ({ arys }) => {
        // from current arys
        if (arys.length > 0) {
            this.setState({ aryId: arys[0].id });
        }
    }

    setAry = (ary) => {
        // from new ary
        if (ary) {
            this.setState({ aryId: ary.id });
        }
    }

    startCurrentLeadArys = (id) => { // Lead Id
        if (this.newCurrentLeadAryRequest) {
            this.newCurrentLeadAryRequest.stop();
        }

        const newCurrentLeadAryRequest = new LeadArysGetRequest(
            this,
            { setArys: this.setArys },
        );
        this.newCurrentLeadAryRequest = newCurrentLeadAryRequest.create(id);
        this.newCurrentLeadAryRequest.start();
    }

    startNewAryRequest = (id) => { // Ary Id
        if (this.newAryRequest) {
            this.newAryRequest.stop();
        }

        const newAryRequest = new AryPostRequest(
            this,
            { setAry: this.setAry },
        );
        this.newAryRequest = newAryRequest.create({ lead: id });
        this.newAryRequest.start();
    }

    handleCreateNewModalClose = (confirm) => {
        if (confirm) {
            this.startNewAryRequest(this.props.leadId);
        } else {
            this.setState({ redirectToProjectLeads: true });
        }
    }

    render() {
        const {
            arysPending,
            aryCreatePending,

            aryId,
            redirectToProjectLeads,
        } = this.state;
        const { arysStrings } = this.props;

        if (arysPending) {
            return <LoadingAnimation />;
        }

        if (isTruthy(aryId)) {
            return <Redirect to={this.getAryLink(aryId)} />;
        }

        if (redirectToProjectLeads) {
            return <Redirect to={this.getProjectLeadsLink()} />;
        }

        return (
            <Confirm
                show
                closeOnEscape
                onClose={this.handleCreateNewModalClose}
            >
                { aryCreatePending && <LoadingAnimation />}
                <p>
                    {arysStrings('createNewAryMessage')}
                </p>
            </Confirm>
        );
    }
}

