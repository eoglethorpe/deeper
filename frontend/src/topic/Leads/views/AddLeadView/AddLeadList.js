/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    ListView,
} from '../../../../public/components/View';

import {
    addLeadViewActiveLeadIdSelector,
    addLeadViewLeadsFilteredSelector,
    setAddLeadViewActiveLeadIdAction,
} from '../../../../common/redux';

import AddLeadListItem from '../../components/AddLeadListItem';
import styles from './styles.scss';

const defaultProps = {
};

const propTypes = {
    activeLeadId: PropTypes.number.isRequired,
    setActiveLeadId: PropTypes.func.isRequired,
    leadsFiltered: PropTypes.array.isRequired, // eslint-disable-line
};

const mapStateToProps = state => ({
    activeLeadId: addLeadViewActiveLeadIdSelector(state),
    leadsFiltered: addLeadViewLeadsFilteredSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setActiveLeadId: id => dispatch(setAddLeadViewActiveLeadIdAction(id)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AddLeadFilter extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    calcLeadKey = lead => lead.data.id

    renderLeadItem = (key, lead) => (
        <AddLeadListItem
            active={this.props.activeLeadId === lead.data.id}
            key={key}
            lead={lead}
            onClick={() => this.props.setActiveLeadId(lead.data.id)}
        />
    )

    render() {
        const { leadsFiltered } = this.props;

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
