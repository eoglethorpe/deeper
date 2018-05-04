/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Button from '../../../vendor/react-store/components/Action/Button';
import DropdownMenu from '../../../vendor/react-store/components/Action/DropdownMenu';

import { iconNames } from '../../../constants';
import _ts from '../../../ts';
import {
    addLeadViewCanNextSelector,
    addLeadViewCanPrevSelector,
    addLeadViewLeadNextAction,
    addLeadViewLeadPrevAction,
} from '../../../redux';

import styles from './styles.scss';

const defaultProps = { };

const propTypes = {
    addLeadViewCanNext: PropTypes.bool.isRequired,
    addLeadViewCanPrev: PropTypes.bool.isRequired,
    addLeadViewLeadNext: PropTypes.func.isRequired,
    addLeadViewLeadPrev: PropTypes.func.isRequired,

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
                        title={_ts('leads', 'previousButtonLabel')}
                    />
                    <Button
                        disabled={!addLeadViewCanNext}
                        onClick={this.handleNextButtonClick}
                        iconName={iconNames.next}
                        title={_ts('leads', 'nextButtonLabel')}
                    />
                </div>
                <DropdownMenu
                    iconName={iconNames.delete}
                    className={styles.removeButtons}
                    title={_ts('leads', 'removeButtonTitle')}
                >
                    <button
                        className={styles.dropdownButton}
                        onClick={handleRemoveButtonClick}
                        disabled={isRemoveDisabledForActive}
                    >
                        {_ts('leads', 'removeCurrentButtonTitle')}
                    </button>
                    <button
                        className={styles.dropdownButton}
                        onClick={handleFilteredRemoveButtonClick}
                        disabled={!isRemoveEnabledForFiltered}
                    >
                        {_ts('leads', 'removeAllFilteredButtonTitle')}
                    </button>
                    <button
                        className={styles.dropdownButton}
                        disabled={!isRemoveEnabledForCompleted}
                        onClick={handleSavedRemoveButtonClick}
                    >
                        {_ts('leads', 'removeAllCompletedButtonTitle')}
                    </button>
                    <button
                        className={styles.dropdownButton}
                        onClick={handleBulkRemoveButtonClick}
                        disabled={!isRemoveEnabledForAll}
                    >
                        {_ts('leads', 'removeAllButtonTitle')}
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
                        {_ts('leads', 'saveCurrentButtonTitle')}
                    </button>
                    <button
                        className={styles.dropdownButton}
                        onClick={handleFilteredSaveButtonClick}
                        disabled={pendingSubmitAll || !isSaveEnabledForFiltered}
                    >
                        {_ts('leads', 'saveAllFilteredButtonTitle')}
                    </button>
                    <button
                        className={styles.dropdownButton}
                        onClick={handleBulkSaveButtonClick}
                        disabled={pendingSubmitAll || !isSaveEnabledForAll}
                    >
                        {_ts('leads', 'saveAllButtonTitle')}
                    </button>
                </DropdownMenu>
            </div>
        );
    }
}
