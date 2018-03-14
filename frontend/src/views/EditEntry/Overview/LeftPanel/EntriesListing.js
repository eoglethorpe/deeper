import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Button from '../../../../vendor/react-store/components/Action/Button';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import ListView from '../../../../vendor/react-store/components/View/List/ListView';

import { entryAccessor, ENTRY_STATUS } from '../../../../entities/entry';

import { entryStringsSelector } from '../../../../redux';
import { iconNames } from '../../../../constants';

import styles from '../../styles.scss';

const propTypes = {
    selectedEntryId: PropTypes.string,
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    choices: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    onEntryDelete: PropTypes.func.isRequired,

    entryStrings: PropTypes.func.isRequired,
    handleEntryItemClick: PropTypes.func.isRequired,
};

const defaultProps = {
    selectedEntryId: undefined,
};

const mapStateToProps = state => ({
    entryStrings: entryStringsSelector(state),
});

@connect(mapStateToProps, undefined)
export default class EntriesListing extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static iconMap = {
        [ENTRY_STATUS.requesting]: `${iconNames.loading} ${styles.pending}`,
        [ENTRY_STATUS.invalid]: `${iconNames.error} ${styles.error}`,
        [ENTRY_STATUS.nonPristine]: `${iconNames.codeWorking} ${styles.pristine}`,
        [ENTRY_STATUS.complete]: `${iconNames.checkCircle} ${styles.complete}`,
        markedForRemoval: `${iconNames.removeCircle} ${styles.error}`,
    };

    static calcEntryKey = entry => entryAccessor.getKey(entry);

    renderIcon = (status) => {
        const className = EntriesListing.iconMap[status] || '';
        return <span className={className} />;
    }

    renderEntryLabel = (entry) => {
        const values = entryAccessor.getValues(entry);

        if (values.entryType === 'image') {
            return (
                <img
                    className={styles.image}
                    src={values.image}
                    alt={this.props.entryStrings('altLabel')}
                />
            );
        }
        // FIXME: use strings
        return (
            <div className={styles.entryExcerpt}>
                {values.excerpt || `Excerpt ${values.order}`}
            </div>
        );
    }

    renderEntryItem = (key, entry) => {
        const {
            selectedEntryId,
            entries,
            onEntryDelete,
            choices,
        } = this.props;

        const currentEntryId = EntriesListing.calcEntryKey(entry);
        const isActive = currentEntryId === selectedEntryId;
        const status = choices[key].choice;
        const selectedEntry = entries.find(
            e => entryAccessor.getKey(e) === currentEntryId,
        );

        const isMarkedForDelete = entryAccessor.isMarkedForDelete(selectedEntry);
        return (
            <div
                className={`${styles.entriesListItem} ${isActive ? styles.active : ''}`}
                key={key}
            >
                <button
                    className={styles.addEntryListItem}
                    onClick={() => this.props.handleEntryItemClick(currentEntryId)}
                    disabled={isMarkedForDelete}
                >
                    {this.renderEntryLabel(entry)}
                    <div className={styles.statusIcons}>
                        {
                            entryAccessor.isMarkedForDelete(entry) &&
                            <span className={EntriesListing.iconMap.markedForRemoval} />
                        }
                        {this.renderIcon(status)}
                    </div>
                </button>
                {
                    isMarkedForDelete ? (
                        <Button
                            key="undo-button"
                            className={styles.removeButton}
                            onClick={() => onEntryDelete(false, key)}
                            iconName={iconNames.undo}
                            title={this.props.entryStrings('removeEntryButtonTitle')}
                        />
                    ) : (
                        <DangerButton
                            key="remove-button"
                            className={styles.removeButton}
                            onClick={() => onEntryDelete(true, key)}
                            iconName={iconNames.delete}
                            title={this.props.entryStrings('undoRemoveEntryButtonTitle')}
                        />
                    )
                }
            </div>
        );
    }

    render() {
        return (
            <ListView
                className={styles.entriesList}
                modifier={this.renderEntryItem}
                data={this.props.entries}
                keyExtractor={EntriesListing.calcEntryKey}
            />
        );
    }
}
