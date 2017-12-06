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
    addLeadViewActiveLeadIdSelector,
    addLeadViewLeadsSelector,
    setAddLeadViewActiveLeadIdAction,
    addLeadViewFiltersSelector,
} from '../../../../../common/redux';

import LeadListItem from './LeadListItem';
import styles from './../styles.scss';

// TODO move this
const strMatchesSub = (str, sub) => (str.toLowerCase().includes(sub.toLowerCase()));

const statusMatches = (leadStatus, status) => {
    switch (status) {
        case 'invalid':
            return leadStatus === 'invalid' || leadStatus === 'warning';
        case 'saved':
            return leadStatus === 'complete';
        case 'unsaved':
            return leadStatus === 'nonstale' || leadStatus === 'uploading' || leadStatus === 'requesting';
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
    setActiveLeadId: id => dispatch(setAddLeadViewActiveLeadIdAction(id)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class LeadList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    calcLeadKey = lead => lead.data.id

    renderLeadItem = (key, lead) => {
        const {
            leadUploads,
            activeLeadId,
            choices,
        } = this.props;

        return (
            <LeadListItem
                active={activeLeadId === this.calcLeadKey(lead)}
                key={key}
                leadKey={key}
                lead={lead}
                choice={choices[key]}
                upload={leadUploads[key]}
                onClick={this.props.setActiveLeadId}
            />
        );
    }

    render() {
        const { filters, leads, choices } = this.props;
        const { search, type, source, status } = filters;

        const leadsFiltered = leads.filter((lead) => {
            const id = this.calcLeadKey(lead);
            const leadStatus = choices[id].choice;
            const {
                title: leadTitle = '',
                source: leadSource = '',
            } = lead.form.values;
            const { type: leadType } = lead.data;

            if (search && search.length > 0 && !strMatchesSub(leadTitle, search)) {
                return false;
            } else if (source && source.length > 0 && !strMatchesSub(leadSource, source)) {
                return false;
            } else if (type && type.length > 0 && type.indexOf(leadType) === -1) {
                return false;
            } else if (status && status.length > 0 && !statusMatches(leadStatus, status)) {
                return false;
            }
            return true;
        });

        return (
            <ListView
                styleName="lead-list"
                data={leadsFiltered}
                keyExtractor={this.calcLeadKey}
                modifier={this.renderLeadItem}
            />
        );
    }
}
