import PropTypes from 'prop-types';
import React from 'react';

import NumberInput from '../../../vendor/react-store/components/Input/NumberInput';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';
import Button from '../../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import Modal from '../../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../../vendor/react-store/components/View/Modal/Footer';
import BoundError from '../../../vendor/react-store/components/General/BoundError';

import WidgetError from '../../../components/WidgetError';
import _ts from '../../../ts';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
};

const defaultProps = {
};

@BoundError(WidgetError)
export default class NumberFrameworkList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            title,
            editAction,
        } = this.props;

        this.state = {
            showEditModal: false,
            title,
        };

        editAction(this.handleEdit);
    }

    handleWidgetTitleChange = (value) => {
        this.setState({ title: value });
    }

    handleEdit = () => {
        this.setState({ showEditModal: true });
    }

    handleModalCancelButtonClick = () => {
        this.setState({
            showEditModal: false,
            title: this.props.title,
        });
    }

    handleModalSaveButtonClick = () => {
        this.setState({ showEditModal: false });
        const { title } = this.state;
        const { onChange } = this.props;

        onChange(
            undefined,
            title,
        );
    }

    renderEditModal = () => {
        const {
            title,
            showEditModal,
        } = this.state;

        if (!showEditModal) {
            return null;
        }

        const headerTitle = _ts('af', 'editTitleModalHeader');
        const titleInputLabel = _ts('af', 'titleLabel');
        const titleInputPlaceholder = _ts('af', 'widgetTitlePlaceholder');
        const cancelButtonLabel = _ts('af', 'cancelButtonLabel');
        const saveButtonLabel = _ts('af', 'saveButtonLabel');

        return (
            <Modal>
                <ModalHeader title={headerTitle} />
                <ModalBody>
                    <TextInput
                        label={titleInputLabel}
                        placeholder={titleInputPlaceholder}
                        onChange={this.handleWidgetTitleChange}
                        value={title}
                        showHintAndError={false}
                        autoFocus
                        selectOnFocus
                    />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.handleModalCancelButtonClick}>
                        { cancelButtonLabel }
                    </Button>
                    <PrimaryButton onClick={this.handleModalSaveButtonClick}>
                        { saveButtonLabel }
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }

    render() {
        const EditModal = this.renderEditModal;
        const separatorText = ' ';

        return (
            <div className={styles.list}>
                <NumberInput
                    className={styles.input}
                    placeholder={_ts('af', 'numberPlaceholder')}
                    showLabel={false}
                    showHintAndError={false}
                    separator={separatorText}
                    disabled
                />
                <EditModal />
            </div>
        );
    }
}
