import PropTypes from 'prop-types';
import React from 'react';

import Organigram from '../../vendor/react-store/components/Visualization/Organigram';
import Button from '../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import AccentButton from '../../vendor/react-store/components/Action/Button/AccentButton';
import Modal from '../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../vendor/react-store/components/View/Modal/Footer';
import HintAndError from '../../vendor/react-store/components/Input/HintAndError';

import { iconNames } from '../../constants';
import styles from './styles.scss';


const propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    showLabel: PropTypes.bool,
    data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func,
    value: PropTypes.string,

    childrenSelector: PropTypes.func,
    labelSelector: PropTypes.func.isRequired,
    idSelector: PropTypes.func,

    disabled: PropTypes.bool,
    error: PropTypes.string,
    hint: PropTypes.string,
    showHintAndError: PropTypes.bool,
};

const defaultProps = {
    className: '',
    label: '',
    showLabel: true,
    onChange: undefined,
    value: undefined,

    childrenSelector: d => d.children,
    labelSelector: d => d.name,
    idSelector: d => d.id,

    disabled: false,
    error: '',
    hint: '',
    showHintAndError: true,
};

export default class OrganigramSelectInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
            showOrgModal: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.props.value) {
            this.setState({ value: nextProps.value });
        }
    }

    getClassName = () => {
        const { className, error, disabled } = this.props;
        const classNames = [
            className,
            styles.organigramSelectInput,
            'organigram-select-input',
        ];

        if (error) {
            classNames.push('error');
            classNames.push(styles.error);
        }

        if (disabled) {
            classNames.push('disabled');
            classNames.push(styles.disabled);
        }

        return classNames.join(' ');
    }

    handleCancelClick = () => {
        const { value } = this.props;
        this.setState({ showOrgModal: false, value });
    }

    handleApplyClick = () => {
        const { value } = this.state;
        const { onChange } = this.props;

        this.setState({ showOrgModal: false }, () => {
            if (onChange) {
                onChange(value);
            }
        });
    }

    handleShowModal = () => {
        this.setState({ showOrgModal: true });
    }

    handleOrgSelection = (value) => {
        this.setState({ value });
    }

    renderOrgModal = () => {
        const {
            label,
            data,
            idSelector,
            labelSelector,
            childrenSelector,
            value,
        } = this.props;
        const { showOrgModal } = this.state;

        if (!showOrgModal) {
            return null;
        }

        return (
            <Modal>
                <ModalHeader title={label} />
                <ModalBody>
                    <Organigram
                        childrenAccessor={childrenSelector}
                        idAccessor={idSelector}
                        labelAccessor={labelSelector}
                        onSelection={this.handleOrgSelection}
                        value={value}
                        data={data}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.handleCancelClick} >
                        Cancel
                    </Button>
                    <PrimaryButton onClick={this.handleApplyClick} >
                        Apply
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }

    renderValue = () => {
        const { value } = this.props;

        if (value === undefined) {
            return (
                <div className={`${styles.undefined} ${styles.value}`}>
                    Select a value
                </div>
            );
        }

        return (
            <div className={styles.value}>
                { value }
            </div>
        );
    }

    renderLabel = () => {
        const {
            showLabel,
            label,
        } = this.props;

        if (!showLabel) {
            return null;
        }

        const classNames = [
            'label',
            styles.label,
        ];

        return (
            <div className={classNames.join(' ')}>
                { label }
            </div>
        );
    }

    render() {
        const {
            showHintAndError,
            hint,
            error,
        } = this.props;
        const OrgModal = this.renderOrgModal;
        const Value = this.renderValue;

        const Label = this.renderLabel;

        return (
            <div className={this.getClassName()}>
                <Label />
                <div className={styles.input}>
                    <Value />
                    <AccentButton
                        className={styles.action}
                        iconName={iconNames.chart}
                        onClick={this.handleShowModal}
                        transparent
                    />
                </div>
                <HintAndError
                    show={showHintAndError}
                    hint={hint}
                    error={error}
                />
                <OrgModal />
            </div>
        );
    }
}
