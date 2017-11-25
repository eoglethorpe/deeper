/**
 * @author frozenhelium <fren.ankit@gmail.com>
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
    activeLeadId: undefined,
};

const propTypes = {
    activeLeadId: PropTypes.string,
    setActiveLeadId: PropTypes.func.isRequired,
    leadsFiltered: PropTypes.array.isRequired, // eslint-disable-line
    leadUploads: PropTypes.shape({
        dummy: PropTypes.string,
    }).isRequired,
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
export default class AddLeadList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    calcLeadKey = lead => lead.data.id

    renderLeadItem = (key, lead) => {
        const {
            leadUploads,
            activeLeadId,
        } = this.props;

        return (
            <AddLeadListItem
                active={activeLeadId === lead.data.id}
                key={key}
                leadKey={key}
                lead={lead}
                upload={leadUploads[key]}
                onClick={this.props.setActiveLeadId}
            />
        );
    }

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
