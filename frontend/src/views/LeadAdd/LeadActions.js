/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Button from '../../vendor/react-store/components/Action/Button';
import DropdownMenu from '../../vendor/react-store/components/Action/DropdownMenu';

import { iconNames } from '../../constants';
import {
    addLeadViewCanNextSelector,
    addLeadViewCanPrevSelector,
    addLeadViewLeadNextAction,
    addLeadViewLeadPrevAction,
    leadsStringsSelector,
} from '../../redux';

import styles from './styles.scss';

const defaultProps = { };

const propTypes = {
    addLeadViewCanNext: PropTypes.bool.isRequired,
    addLeadViewCanPrev: PropTypes.bool.isRequired,
    addLeadViewLeadNext: PropTypes.func.isRequired,
    addLeadViewLeadPrev: PropTypes.func.isRequired,
    leadsStrings: PropTypes.func.isRequired,

    isRemoveDisabledForActive: PropTypes.bool.isRequired,
    isRemoveEnabledForAll: PropTypes.bool.isRequired,
    isRemoveEnabledForFiltered: PropTypes.bool.isRequired,
    isRemoveEnabledForCompleted: PropTypes.bool.isRequired,
    isSaveDisabledForActive: PropTypes.bool.isRequired,
    isSaveEnabledForAll: PropTypes.bool.isRequired,
    isSaveEnabledForFiltered: PropTypes.bool.isRequired,
    pendingSubmitAll: PropTypes.bool.isRequired,

    handleBulkRemoveButtonClick: PropTypes.func.isRequired,
    handleBulkSaveButtonClick: PropTypes.func.isRequired,
    handleFilteredRemoveButtonClick: PropTypes.func.isRequired,
    handleSavedRemoveButtonClick: PropTypes.func.isRequired,
    handleFilteredSaveButtonClick: PropTypes.func.isRequired,
    handleRemoveButtonClick: PropTypes.func.isRequired,
    handleSaveButtonClick: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    addLeadViewCanNext: addLeadViewCanNextSelector(state),
    addLeadViewCanPrev: addLeadViewCanPrevSelector(state),
    leadsStrings: leadsStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addLeadViewLeadNext: params => dispatch(addLeadViewLeadNextAction(params)),
    addLeadViewLeadPrev: params => dispatch(addLeadViewLeadPrevAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class LeadFilter extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleNextButtonClick = () => {
        this.props.addLeadViewLeadNext();
    }

    handlePrevButtonClick = () => {
        this.props.addLeadViewLeadPrev();
    }

    render() {
        const {
            addLeadViewCanNext,
            addLeadViewCanPrev,
            isRemoveDisabledForActive,
            isRemoveEnabledForAll,
            isRemoveEnabledForFiltered,
            isRemoveEnabledForCompleted,
            isSaveDisabledForActive,
            isSaveEnabledForAll,
            isSaveEnabledForFiltered,
            pendingSubmitAll,
            leadsStrings,
            handleRemoveButtonClick,
            handleFilteredRemoveButtonClick,
            handleSavedRemoveButtonClick,
            handleBulkRemoveButtonClick,
            handleSaveButtonClick,
            handleFilteredSaveButtonClick,
            handleBulkSaveButtonClick,
        } = this.props;

        return (
            <div className={styles.actionButtons}>
                <div className={styles.movementButtons}>
                    <Button
                        disabled={!addLeadViewCanPrev}
                        onClick={this.handlePrevButtonClick}
                        iconName={iconNames.prev}
                        title={leadsStrings('previousButtonLabel')}
                    />
                    <Button
                        disabled={!addLeadViewCanNext}
                        onClick={this.handleNextButtonClick}
                        iconName={iconNames.next}
                        title={leadsStrings('nextButtonLabel')}
                    />
                </div>
                <DropdownMenu
                    iconName={iconNames.delete}
                    className={styles.removeButtons}
                    title={leadsStrings('removeButtonTitle')}
                >
                    <button
                        className={styles.dropdownButton}
                        onClick={handleRemoveButtonClick}
                        disabled={isRemoveDisabledForActive}
                    >
                        {leadsStrings('removeCurrentButtonTitle')}
                    </button>
                    <button
                        className={styles.dropdownButton}
                        onClick={handleFilteredRemoveButtonClick}
                        disabled={!isRemoveEnabledForFiltered}
                    >
                        {leadsStrings('removeAllFilteredButtonTitle')}
                    </button>
                    <button
                        className={styles.dropdownButton}
                        disabled={!isRemoveEnabledForCompleted}
                        onClick={handleSavedRemoveButtonClick}
                    >
                        {leadsStrings('removeAllCompletedButtonTitle')}
                    </button>
                    <button
                        className={styles.dropdownButton}
                        onClick={handleBulkRemoveButtonClick}
                        disabled={!isRemoveEnabledForAll}
                    >
                        {leadsStrings('removeAllButtonTitle')}
                    </button>
                </DropdownMenu>
                <DropdownMenu
                    iconName={iconNames.save}
                    className={styles.saveButtons}
                    title="Save" // FIXME: use strings
                >
                    <button
                        className={styles.dropdownButton}
                        onClick={handleSaveButtonClick}
                        disabled={isSaveDisabledForActive}
                    >
                        {leadsStrings('saveCurrentButtonTitle')}
                    </button>
                    <button
                        className={styles.dropdownButton}
                        onClick={handleFilteredSaveButtonClick}
                        disabled={pendingSubmitAll || !isSaveEnabledForFiltered}
                    >
                        {leadsStrings('saveAllFilteredButtonTitle')}
                    </button>
                    <button
                        className={styles.dropdownButton}
                        onClick={handleBulkSaveButtonClick}
                        disabled={pendingSubmitAll || !isSaveEnabledForAll}
                    >
                        {leadsStrings('saveAllButtonTitle')}
                    </button>
                </DropdownMenu>
            </div>
        );
    }
}
