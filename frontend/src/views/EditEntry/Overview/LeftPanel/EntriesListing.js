import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Button from '../../../../vendor/react-store/components/Action/Button';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import ListItem from '../../../../vendor/react-store/components/View/List/ListItem';
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
@CSSModules(styles, { allowMultiple: true })
export default class LeftPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static iconMap = {
        [ENTRY_STATUS.requesting]: `${iconNames.loading} pending`,
        [ENTRY_STATUS.invalid]: `${iconNames.error} error`,
        [ENTRY_STATUS.nonPristine]: `${iconNames.codeWorking} pristine`,
        [ENTRY_STATUS.complete]: `${iconNames.checkCircle} complete`,
    };

    static calcEntryKey = entry => entryAccessor.getKey(entry);

    renderIcon = (status) => {
        const className = LeftPanel.iconMap[status] || '';
        return <span className={className} />;
    }

    renderEntryLabel = (entry) => {
        const values = entryAccessor.getValues(entry);

        if (values.entryType === 'image') {
            return (
                <img
                    className="image"
                    src={values.image}
                    alt={this.props.entryStrings('altLabel')}
                />
            );
        }
        // FIXME: use strings
        return (
            <div className="entry-excerpt">
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

        const currentEntryId = LeftPanel.calcEntryKey(entry);
        const isActive = currentEntryId === selectedEntryId;
        const status = choices[key].choice;
        const selectedEntry = entries.find(
            e => entryAccessor.getKey(e) === currentEntryId,
        );

        const isMarkedForDelete = entryAccessor.isMarkedForDelete(selectedEntry);
        return (
            <ListItem
                className="entries-list-item"
                key={key}
                active={isActive}
                // scrollIntoView={isActive}
            >
                <button
                    className="add-entry-list-item"
                    onClick={() => this.props.handleEntryItemClick(currentEntryId)}
                    disabled={isMarkedForDelete}
                >
                    {this.renderEntryLabel(entry)}
                    <div className="status-icons">
                        {
                            entryAccessor.isMarkedForDelete(entry) &&
                            <span className={`${iconNames.removeCircle} error`} />
                        }
                        {this.renderIcon(status)}
                    </div>
                </button>
                {
                    isMarkedForDelete ? (
                        <Button
                            key="undo-button"
                            className="remove-button"
                            onClick={() => onEntryDelete(false, key)}
                            iconName={iconNames.undo}
                            title={this.props.entryStrings('removeEntryButtonTitle')}
                        />
                    ) : (
                        <DangerButton
                            key="remove-button"
                            className="remove-button"
                            onClick={() => onEntryDelete(true, key)}
                            iconName={iconNames.delete}
                            title={this.props.entryStrings('undoRemoveEntryButtonTitle')}
                        />
                    )
                }
            </ListItem>
        );
    }

    render() {
        console.log('Rendering EditEntry:Overview:LeftPanel:EntriesListing');

        return (
            <ListView
                className={styles.entriesList}
                modifier={this.renderEntryItem}
                data={this.props.entries}
                keyExtractor={LeftPanel.calcEntryKey}
            />
        );
    }
}
