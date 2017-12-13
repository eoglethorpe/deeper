/**
 * @author frozenhelium <fren.ankit@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    ListView,
} from '../../../../../public/components/View';
import {
    caseInsensitiveSubmatch,
} from '../../../../../public/utils/common';

import {
    addLeadViewActiveLeadIdSelector,
    addLeadViewLeadsSelector,
    addLeadViewSetActiveLeadIdAction,
    addLeadViewFiltersSelector,
} from '../../../../../common/redux';

import { LEAD_STATUS, LEAD_FILTER_STATUS } from '../utils/constants';
import { leadAccessor } from '../utils/leadState';

import LeadListItem from './LeadListItem';
import styles from './../styles.scss';

const statusMatches = (leadStatus, status) => {
    switch (status) {
        case LEAD_FILTER_STATUS.invalid:
            return (
                leadStatus === LEAD_STATUS.invalid ||
                leadStatus === LEAD_STATUS.warning
            );
        case LEAD_FILTER_STATUS.saved:
            return leadStatus === LEAD_STATUS.complete;
        case LEAD_FILTER_STATUS.unsaved:
            return (
                leadStatus === LEAD_STATUS.nonstale ||
                leadStatus === LEAD_STATUS.uploading ||
                leadStatus === LEAD_STATUS.requesting
            );
        default:
            return false;
    }
};

const propTypes = {
    activeLeadId: PropTypes.string,
    setActiveLeadId: PropTypes.func.isRequired,
    leads: PropTypes.array.isRequired, // eslint-disable-line
    filters: PropTypes.object.isRequired, // eslint-disable-line
    leadUploads: PropTypes.object.isRequired, // eslint-disable-line
    choices: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    activeLeadId: undefined,
};

const mapStateToProps = state => ({
    activeLeadId: addLeadViewActiveLeadIdSelector(state),
    leads: addLeadViewLeadsSelector(state),
    filters: addLeadViewFiltersSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setActiveLeadId: id => dispatch(addLeadViewSetActiveLeadIdAction(id)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class LeadList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = { leadsFiltered: [] };
    }

    componentWillReceiveProps(nextProps) {
        const { filters, leads, choices } = nextProps;

        if (
            this.props.filters !== filters ||
            this.props.leads !== leads ||
            this.props.choices !== choices
        ) {
            const { search, type, source, status } = filters;
            const leadsFiltered = leads.filter((lead) => {
                const id = leadAccessor.getKey(lead);
                const leadType = leadAccessor.getType(lead);
                const {
                    title: leadTitle = '',
                    source: leadSource = '',
                } = leadAccessor.getValues(lead);

                const leadStatus = choices[id].choice;

                if (!caseInsensitiveSubmatch(leadTitle, search)) {
                    return false;
                } else if (!caseInsensitiveSubmatch(leadSource, source)) {
                    return false;
                } else if (type && type.length > 0 && type.indexOf(leadType) === -1) {
                    return false;
                } else if (status && status.length > 0 && !statusMatches(leadStatus, status)) {
                    return false;
                }
                return true;
            });
            this.setState({ leadsFiltered });
        }
    }

    renderLeadItem = (key, lead) => {
        const {
            leadUploads,
            activeLeadId,
            choices,
            setActiveLeadId,
        } = this.props;

        return (
            <LeadListItem
                active={activeLeadId === leadAccessor.getKey(lead)}
                key={key}
                leadKey={key}
                lead={lead}
                choice={choices[key].choice}
                upload={leadUploads[key]}
                onClick={setActiveLeadId}
            />
        );
    }

    render() {
        const { leadsFiltered } = this.state;
        return (
            <ListView
                styleName="lead-list"
                data={leadsFiltered}
                keyExtractor={leadAccessor.getKey}
                modifier={this.renderLeadItem}
            />
        );
    }
}
