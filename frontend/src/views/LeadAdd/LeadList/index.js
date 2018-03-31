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
} from '../../../redux';
import { leadAccessor } from '../../../entities/lead';

import LeadListItem from './LeadListItem';
import styles from './styles.scss';

const propTypes = {
    activeLeadId: PropTypes.string,
    setActiveLeadId: PropTypes.func.isRequired,
    leads: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    leadUploads: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    globalUiState: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onLeadRemove: PropTypes.func.isRequired,
};

const defaultProps = {
    activeLeadId: undefined,
};

const mapStateToProps = state => ({
    activeLeadId: addLeadViewActiveLeadIdSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setActiveLeadId: id => dispatch(addLeadViewSetActiveLeadIdAction(id)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class LeadList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderLeadItem = (key, lead) => {
        const {
            leadUploads,
            activeLeadId,
            globalUiState,
            setActiveLeadId,
            onLeadRemove,
        } = this.props;

        const active = leadAccessor.getKey(lead) === activeLeadId;

        const {
            leadState,
            isRemoveDisabled,
        } = globalUiState[key];
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
                onRemove={onLeadRemove}
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
