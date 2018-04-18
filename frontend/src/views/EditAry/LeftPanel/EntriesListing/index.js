import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { reverseRoute } from '../../../../vendor/react-store/utils/common';
import { pathNames } from '../../../../constants';

import ListView from '../../../../vendor/react-store/components/View/List/ListView';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';

import {
    leadIdFromRouteSelector,
    entryStringsSelector,
    editAryEntriesSelector,
    setEntriesForEditAryAction,
    projectIdFromRouteSelector,
    aryStringsSelector,
} from '../../../../redux';

import EntriesRequest from './requests/EntriesRequest';
import styles from './styles.scss';

const propTypes = {
    activeLeadId: PropTypes.number.isRequired,
    leadId: PropTypes.number.isRequired,
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    entryStrings: PropTypes.func.isRequired,
    setEntries: PropTypes.func.isRequired,
    activeProjectId: PropTypes.number.isRequired,
    aryStrings: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    activeLeadId: leadIdFromRouteSelector(state),
    entryStrings: entryStringsSelector(state),
    entries: editAryEntriesSelector(state),
    aryStrings: aryStringsSelector(state),
    activeProjectId: projectIdFromRouteSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setEntries: params => dispatch(setEntriesForEditAryAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class EntriesListing extends React.PureComponent {
    static propTypes = propTypes;

    static calcEntryKey = entry => entry.id;

    constructor(props) {
        super(props);

        this.state = {
            pendingEntries: true,
        };
    }

    componentWillMount() {
        const { leadId } = this.props;

        const request = new EntriesRequest({
            setState: params => this.setState(params),
            setEntries: this.props.setEntries,
        });
        this.entriesRequest = request.create(leadId);
        this.entriesRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.leadId !== nextProps.leadId) {
            if (this.entriesRequest) {
                this.entriesRequest.stop();
            }

            const request = new EntriesRequest();
            this.entriesRequest = request.create(nextProps.leadId);
            this.entriesRequest.start();
        }
    }

    componentWillUnmount() {
        if (this.entriesRequest) {
            this.entriesRequest.stop();
        }
    }

    renderEntryLabel = (entry) => {
        if (entry.entryType === 'image') {
            return (
                <img
                    className={styles.image}
                    src={entry.image}
                    alt={this.props.entryStrings('altLabel')}
                />
            );
        }

        // FIXME: use strings
        return (
            <div className={styles.entryExcerpt}>
                {entry.excerpt || `Excerpt ${entry.order}`}
            </div>
        );
    }

    renderEntryItem = (key, entry) => (
        <div
            key={key}
            className={styles.entriesListItem}
        >
            <div className={styles.addEntryListItem} >
                {this.renderEntryLabel(entry)}
            </div>
        </div>
    )

    render() {
        const linkToEditEntries = reverseRoute(
            pathNames.editEntries,
            {
                projectId: this.props.activeProjectId,
                leadId: this.props.activeLeadId,
            },
        );

        return (
            <div className={styles.entriesList}>
                { this.state.pendingEntries && <LoadingAnimation />}
                <Link to={linkToEditEntries}>
                    {this.props.aryStrings('editEntriesText')}
                </Link>
                <ListView
                    className={styles.scrollWrapper}
                    modifier={this.renderEntryItem}
                    data={this.props.entries}
                    keyExtractor={EntriesListing.calcEntryKey}
                />
            </div>
        );
    }
}
