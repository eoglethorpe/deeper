/**
 * @author frozenhelium <fren.ankit@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { ListView } from '../../../../../public/components/View';

import {
    addLeadViewActiveLeadIdSelector,
    addLeadViewSetActiveLeadIdAction,
} from '../../../../../common/redux';

import { leadAccessor } from '../../../../../common/entities/lead';


import LeadListItem from './LeadListItem';
import styles from './../styles.scss';

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
@CSSModules(styles, { allowMultiple: true })
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
                styleName="lead-list"
                data={leads}
                keyExtractor={leadAccessor.getKey}
                modifier={this.renderLeadItem}
            />
        );
    }
}
