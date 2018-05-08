/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Button from '../../../vendor/react-store/components/Action/Button';
import Checkbox from '../../../vendor/react-store/components/Input/Checkbox';
import DropdownMenu from '../../../vendor/react-store/components/Action/DropdownMenu';
import Confirm from '../../../vendor/react-store/components/View/Modal/Confirm';

import { iconNames } from '../../../constants';
import _ts from '../../../ts';
import notify from '../../../notify';
import {
    addLeadViewActiveLeadIdSelector,

    addLeadViewCanNextSelector,
    addLeadViewCanPrevSelector,
    addLeadViewLeadNextAction,
    addLeadViewLeadPrevAction,
    addLeadViewButtonStatesSelector,
    addLeadViewLeadStatesSelector,
    addLeadViewLeadRemoveAction,
    addLeadViewLeadKeysSelector,
    addLeadViewFilteredLeadKeysSelector,
    addLeadViewCompletedLeadKeysSelector,
    addLeadViewSetRemoveModalStateAction,
    addLeadViewUnsetRemoveModalStateAction,
    addLeadViewRemoveModalStateSelector,

    addLeadViewHidePreviewSelector,
    addLeadViewSetPreviewAction,
} from '../../../redux';

import styles from './styles.scss';

// 5544735

const defaultProps = {
    activeLeadId: undefined,
    hidePreview: false,
};

const propTypes = {
    addLeadViewCanNext: PropTypes.bool.isRequired,
    addLeadViewCanPrev: PropTypes.bool.isRequired,
    addLeadViewLeadNext: PropTypes.func.isRequired,
    addLeadViewLeadPrev: PropTypes.func.isRequired,

    pendingSubmitAll: PropTypes.bool.isRequired,

    buttonStates: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    leadStates: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    activeLeadId: PropTypes.string,

    addLeadViewLeadRemove: PropTypes.func.isRequired,
    leadKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
    filteredLeadKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
    completedLeadKeys: PropTypes.arrayOf(PropTypes.string).isRequired,

    setRemoveModalState: PropTypes.func.isRequired,
    unsetRemoveModalState: PropTypes.func.isRequired,
    removeModalState: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    // eslint-disable-next-line react/forbid-prop-types
    uploadCoordinator: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    formCoordinator: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    leadFormRefs: PropTypes.object.isRequired,

    hidePreview: PropTypes.bool,
    setPreview: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    addLeadViewCanNext: addLeadViewCanNextSelector(state),
    addLeadViewCanPrev: addLeadViewCanPrevSelector(state),
    buttonStates: addLeadViewButtonStatesSelector(state),
    leadStates: addLeadViewLeadStatesSelector(state),
    activeLeadId: addLeadViewActiveLeadIdSelector(state),

    leadKeys: addLeadViewLeadKeysSelector(state),
    filteredLeadKeys: addLeadViewFilteredLeadKeysSelector(state),
    completedLeadKeys: addLeadViewCompletedLeadKeysSelector(state),
    removeModalState: addLeadViewRemoveModalStateSelector(state),
    hidePreview: addLeadViewHidePreviewSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addLeadViewLeadNext: params => dispatch(addLeadViewLeadNextAction(params)),
    addLeadViewLeadPrev: params => dispatch(addLeadViewLeadPrevAction(params)),

    addLeadViewLeadRemove: params => dispatch(addLeadViewLeadRemoveAction(params)),
    setRemoveModalState: params => dispatch(addLeadViewSetRemoveModalStateAction(params)),
    unsetRemoveModalState: params => dispatch(addLeadViewUnsetRemoveModalStateAction(params)),
    setPreview: params => dispatch(addLeadViewSetPreviewAction(params)),
});

export const DELETE_MODE = {
    all: 'all',
    filtered: 'filtered',
    single: 'single',
    saved: 'saved',
};

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

    handleRemoveButtonClick = () => {
        this.props.setRemoveModalState({
            show: true,
            mode: DELETE_MODE.single,
            leadId: this.props.activeLeadId,
        });
    }

    handleFilteredRemoveButtonClick = () => {
        this.props.setRemoveModalState({
            show: true,
            mode: DELETE_MODE.filtered,
        });
    }

    handleSavedRemoveButtonClick = () => {
        this.props.setRemoveModalState({
            show: true,
            mode: DELETE_MODE.saved,
        });
    }

    handleBulkRemoveButtonClick = () => {
        this.props.setRemoveModalState({
            show: true,
            mode: DELETE_MODE.all,
        });
    }


    removeSelected = (leadId) => {
        this.props.uploadCoordinator.remove(leadId);
        this.props.addLeadViewLeadRemove(leadId);

        notify.send({
            title: _ts('notification', 'leadDiscard'),
            type: notify.type.SUCCESS,
            message: _ts('notification', 'leadDiscardSuccess'),
            duration: notify.duration.MEDIUM,
        });
    }

    removeFiltered = () => {
        this.props.filteredLeadKeys.forEach((leadId) => {
            this.props.uploadCoordinator.remove(leadId);
            this.props.addLeadViewLeadRemove(leadId);
        });

        notify.send({
            title: _ts('notification', 'leadsDiscard'),
            type: notify.type.SUCCESS,
            message: _ts('notification', 'leadsDiscardSuccess'),
            duration: notify.duration.MEDIUM,
        });
    }

    removeCompleted = () => {
        this.props.completedLeadKeys.forEach((leadId) => {
            this.props.uploadCoordinator.remove(leadId);
            this.props.addLeadViewLeadRemove(leadId);
        });

        notify.send({
            title: _ts('notification', 'leadsDiscard'),
            type: notify.type.SUCCESS,
            message: _ts('notification', 'leadsDiscardSuccess'),
            duration: notify.duration.MEDIUM,
        });
    }

    removeBulk = () => {
        this.props.leadKeys.forEach((leadId) => {
            this.props.uploadCoordinator.remove(leadId);
            this.props.addLeadViewLeadRemove(leadId);
        });

        notify.send({
            title: _ts('notification', 'leadsDiscard'),
            type: notify.type.SUCCESS,
            message: _ts('notification', 'leadsDiscardSuccess'),
            duration: notify.duration.MEDIUM,
        });
    }

    handleRemoveLeadModalClose = (confirm) => {
        if (confirm) {
            const {
                leadId,
                mode,
            } = this.props.removeModalState;

            switch (mode) {
                case DELETE_MODE.single:
                    this.removeSelected(leadId);
                    break;
                case DELETE_MODE.filtered:
                    this.removeFiltered();
                    break;
                case DELETE_MODE.all:
                    this.removeBulk();
                    break;
                case DELETE_MODE.saved:
                    this.removeCompleted();
                    break;
                default:
                    break;
            }
        }

        this.props.unsetRemoveModalState();
    }

    handleSaveButtonClick = () => {
        const leadId = this.props.activeLeadId;
        this.props.formCoordinator.add(leadId, this.props.leadFormRefs[leadId]);
        this.props.formCoordinator.start();
    }

    handleFilteredSaveButtonClick = () => {
        this.props.filteredLeadKeys.forEach((id) => {
            this.props.formCoordinator.add(id, this.props.leadFormRefs[id]);
        });
        this.props.formCoordinator.start();
    }

    handleBulkSaveButtonClick = () => {
        this.props.leadKeys.forEach((id) => {
            this.props.formCoordinator.add(id, this.props.leadFormRefs[id]);
        });
        this.props.formCoordinator.start();
    }

    render() {
        const {
            addLeadViewCanNext,
            addLeadViewCanPrev,
            pendingSubmitAll,

            buttonStates,
            leadStates,
            activeLeadId,
            removeModalState,
        } = this.props;

        const { show } = removeModalState;

        const {
            isSaveEnabledForAll,
            isRemoveEnabledForAll,
            isSaveEnabledForFiltered,
            isRemoveEnabledForFiltered,
            isRemoveEnabledForCompleted,
        } = buttonStates;

        // FIXME: doesn't require pulling all leadStates
        const {
            isSaveDisabled: isSaveDisabledForActive,
            isRemoveDisabled: isRemoveDisabledForActive,
        } = leadStates[activeLeadId] || {};

        return (
            <div className={styles.actionButtons}>
                <Checkbox
                    value={!this.props.hidePreview}
                    onChange={() => this.props.setPreview(!this.props.hidePreview)}
                    label={_ts('addLeads', 'showLeadPreviewLabel')}
                />
                <div className={styles.movementButtons}>
                    <Button
                        disabled={!addLeadViewCanPrev}
                        onClick={this.handlePrevButtonClick}
                        iconName={iconNames.prev}
                        title={_ts('addLeads', 'previousButtonLabel')}
                    />
                    <Button
                        disabled={!addLeadViewCanNext}
                        onClick={this.handleNextButtonClick}
                        iconName={iconNames.next}
                        title={_ts('addLeads', 'nextButtonLabel')}
                    />
                </div>
                <Confirm
                    onClose={this.handleRemoveLeadModalClose}
                    show={!!show}
                >
                    <p>
                        {
                            /* TODO: different message for delete modes */
                            _ts('addLeads', 'deleteLeadConfirmText')
                        }
                    </p>
                </Confirm>
                <DropdownMenu
                    iconName={iconNames.delete}
                    className={styles.removeButtons}
                    title={_ts('addLeads', 'removeButtonTitle')}
                >
                    <button
                        className={styles.dropdownButton}
                        onClick={this.handleRemoveButtonClick}
                        disabled={isRemoveDisabledForActive}
                        type="button"
                    >
                        {_ts('addLeads', 'removeCurrentButtonTitle')}
                    </button>
                    <button
                        className={styles.dropdownButton}
                        onClick={this.handleFilteredRemoveButtonClick}
                        disabled={!isRemoveEnabledForFiltered}
                        type="button"
                    >
                        {_ts('addLeads', 'removeAllFilteredButtonTitle')}
                    </button>
                    <button
                        className={styles.dropdownButton}
                        disabled={!isRemoveEnabledForCompleted}
                        onClick={this.handleSavedRemoveButtonClick}
                        type="button"
                    >
                        {_ts('addLeads', 'removeAllCompletedButtonTitle')}
                    </button>
                    <button
                        className={styles.dropdownButton}
                        onClick={this.handleBulkRemoveButtonClick}
                        disabled={!isRemoveEnabledForAll}
                        type="button"
                    >
                        {_ts('addLeads', 'removeAllButtonTitle')}
                    </button>
                </DropdownMenu>
                <DropdownMenu
                    iconName={iconNames.save}
                    className={styles.saveButtons}
                    title={_ts('addLeads', 'saveButtonTitle')}
                >
                    <button
                        className={styles.dropdownButton}
                        onClick={this.handleSaveButtonClick}
                        disabled={isSaveDisabledForActive}
                        type="button"
                    >
                        {_ts('addLeads', 'saveCurrentButtonTitle')}
                    </button>
                    <button
                        className={styles.dropdownButton}
                        onClick={this.handleFilteredSaveButtonClick}
                        disabled={pendingSubmitAll || !isSaveEnabledForFiltered}
                        type="button"
                    >
                        {_ts('addLeads', 'saveAllFilteredButtonTitle')}
                    </button>
                    <button
                        className={styles.dropdownButton}
                        onClick={this.handleBulkSaveButtonClick}
                        disabled={pendingSubmitAll || !isSaveEnabledForAll}
                        type="button"
                    >
                        {_ts('addLeads', 'saveAllButtonTitle')}
                    </button>
                </DropdownMenu>
            </div>
        );
    }
}
