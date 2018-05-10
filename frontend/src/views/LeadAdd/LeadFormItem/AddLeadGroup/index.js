import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Modal from '../../../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../../vendor/react-store/components/View/Modal/Body';
import NonFieldErrors from '../../../../vendor/react-store/components/Input/NonFieldErrors';
import TextInput from '../../../../vendor/react-store/components/Input/TextInput';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import Faram, {
    requiredCondition,
} from '../../../../vendor/react-store/components/Input/Faram';
import {
    addLeadGroupOfProjectAction,
} from '../../../../redux';

import _ts from '../../../../ts';
import LeadGroupCreateRequest from '../../requests/LeadGroupCreateRequest';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    projectId: PropTypes.number,
    onModalClose: PropTypes.func.isRequired,
    addLeadGroup: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    projectId: undefined,
};

const mapDispatchToProps = dispatch => ({
    addLeadGroup: params => dispatch(addLeadGroupOfProjectAction(params)),
});

@connect(undefined, mapDispatchToProps)
export default class AddLeadGroup extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: {},
            pending: false,
            pristine: false,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
            },
        };
    }

    componentWillUnmount() {
    }

    startLeadGroupCreateRequest = (newLeadGroup) => {
        if (this.requestForLeadGroupCreate) {
            this.requestForLeadGroupCreate.stop();
        }
        const requestForLeadGroupCreate = new LeadGroupCreateRequest({
            setState: v => this.setState(v),
            handleModalClose: this.props.onModalClose,
            addLeadGroup: this.props.addLeadGroup,
        });
        this.requestForLeadGroupCreate = requestForLeadGroupCreate.create(newLeadGroup);
        this.requestForLeadGroupCreate.start();
    }

    // faram RELATED
    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    };

    handleValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleValidationSuccess = (values) => {
        const newLeadGroup = {
            ...values,
            project: this.props.projectId,
        };
        this.startLeadGroupCreateRequest(newLeadGroup);
    };

    render() {
        const {
            faramErrors,
            faramValues,
            pending,
            pristine,
        } = this.state;

        const { className } = this.props;

        return (
            <Modal>
                <ModalHeader title={_ts('addLeads', 'addLeadGroupModalTitle')} />
                <ModalBody>
                    {pending && <LoadingAnimation />}
                    <Faram
                        className={`${className} ${styles.addLeadGroup}`}
                        onChange={this.handleFaramChange}
                        onValidationFailure={this.handleValidationFailure}
                        onValidationSuccess={this.handleValidationSuccess}
                        schema={this.schema}
                        value={faramValues}
                        error={faramErrors}
                        disabled={pending}
                    >
                        <NonFieldErrors faramElement />
                        <TextInput
                            label={_ts('addLeads', 'addLeadGroupTitleLabel')}
                            faramElementName="title"
                            placeholder={_ts('addLeads', 'addLeadGroupTitlePlaceholder')}
                            autoFocus
                        />
                        <div className={styles.actionButtons}>
                            <DangerButton onClick={this.props.onModalClose}>
                                {_ts('addLeads', 'modalCancelLabel')}
                            </DangerButton>
                            <PrimaryButton
                                disabled={pending || !pristine}
                                type="submit"
                            >
                                {_ts('addLeads', 'modalAddLabel')}
                            </PrimaryButton>
                        </div>
                    </Faram>
                </ModalBody>
            </Modal>
        );
    }
}
