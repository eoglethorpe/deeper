import PropTypes from 'prop-types';
import React from 'react';

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

@BoundError(WidgetError)
export default class GeoFrameworkList extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        const {
            title,
            editAction,
        } = props;

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

    handleEditModalCancelButtonClick = () => {
        const { title } = this.props;
        this.setState({
            showEditModal: false,
            title,
        });
    }

    handleEditModalSaveButtonClick = () => {
        this.setState({ showEditModal: false });
        const { title } = this.state;
        const { onChange } = this.props;
        onChange(undefined, title);
    }

    renderEditModal = () => {
        const {
            showEditModal,
            title: titleValue,
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
                        autoFocus
                        label={titleInputLabel}
                        placeholder={titleInputPlaceholder}
                        onChange={this.handleWidgetTitleChange}
                        selectOnFocus
                        showHintAndError={false}
                        value={titleValue}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.handleEditModalCancelButtonClick}>
                        { cancelButtonLabel }
                    </Button>
                    <PrimaryButton onClick={this.handleEditModalSaveButtonClick}>
                        { saveButtonLabel }
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }

    render() {
        const contentText = _ts('af', 'geoAreaButtonLabel');
        const EditModal = this.renderEditModal;

        return ([
            <div
                key="content"
                className={styles.list}
            >
                { contentText }
            </div>,
            <EditModal key="modal" />,
        ]);
    }
}
