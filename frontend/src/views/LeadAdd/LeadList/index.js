/**
 * @author frozenhelium <fren.ankit@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import ListView from '../../../vendor/react-store/components/View/List/ListView';

import {
    addLeadViewActiveLeadIdSelector,
    addLeadViewSetActiveLeadIdAction,
    addLeadViewSetRemoveModalStateAction,
    addLeadViewLeadStatesSelector,
    addLeadViewFilteredLeadsSelector,
    addLeadViewLeadUploadsSelector,
} from '../../../redux';
import { leadAccessor } from '../../../entities/lead';

import { DELETE_MODE } from '../LeadActions';
import LeadListItem from './LeadListItem';
import styles from './styles.scss';

const propTypes = {
    activeLeadId: PropTypes.string,
    setActiveLeadId: PropTypes.func.isRequired,
    leads: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    leadUploads: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setRemoveModalState: PropTypes.func.isRequired,
    leadStates: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    activeLeadId: undefined,
};

const mapStateToProps = state => ({
    activeLeadId: addLeadViewActiveLeadIdSelector(state),
    leadStates: addLeadViewLeadStatesSelector(state),
    leads: addLeadViewFilteredLeadsSelector(state),
    leadUploads: addLeadViewLeadUploadsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setActiveLeadId: id => dispatch(addLeadViewSetActiveLeadIdAction(id)),
    setRemoveModalState: params => dispatch(addLeadViewSetRemoveModalStateAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class LeadList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleLeadRemove = (leadId) => {
        this.props.setRemoveModalState({
            show: true,
            mode: DELETE_MODE.single,
            leadId,
        });
    }

    renderLeadItem = (key, lead) => {
        const {
            leadUploads,
            activeLeadId,
            leadStates,
            setActiveLeadId,
        } = this.props;

        const active = leadAccessor.getKey(lead) === activeLeadId;

        const {
            leadState,
            isRemoveDisabled,
        } = leadStates[key];
        const upload = leadUploads[key];

        return (
            <LeadListItem
                key={key}
                active={active}
                leadState={leadState}
                isRemoveDisabled={isRemoveDisabled}
                lead={lead}
                leadKey={key}
                onClick={setActiveLeadId}
                onRemove={this.handleLeadRemove}
                upload={upload}
            />
        );
    }

    render() {
        const { leads } = this.props;
        return (
            <ListView
                className={styles.leadList}
                data={leads}
                keyExtractor={leadAccessor.getKey}
                modifier={this.renderLeadItem}
            />
        );
    }
}
