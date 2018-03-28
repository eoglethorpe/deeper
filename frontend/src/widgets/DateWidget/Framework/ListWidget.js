import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Checkbox from '../../../vendor/react-store/components/Input/Checkbox';
import DateInput from '../../../vendor/react-store/components/Input/DateInput';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';
import Button from '../../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import Modal from '../../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../../vendor/react-store/components/View/Modal/Footer';

import BoundError from '../../../vendor/react-store/components/General/BoundError';
import WidgetError from '../../../components/WidgetError';
import { afStringsSelector } from '../../../redux';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    afStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    data: {},
};

const emptyObject = {};

const mapStateToProps = state => ({
    afStrings: afStringsSelector(state),
});

@BoundError(WidgetError)
@connect(mapStateToProps)
export default class DateFrameworkList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            title,
            editAction,
        } = props;

        const informationDateSelected = (props.data || emptyObject).informationDateSelected;
        this.state = {
            showEditModal: false,
            title,
            informationDateSelected,
        };
        editAction(this.handleEdit);
    }

    handleWidgetTitleChange = (value) => {
        this.setState({ title: value });
    }

    handleInformationDataCheck = (value) => {
        this.setState({ informationDateSelected: value });
    }

    handleEdit = () => {
        this.setState({ showEditModal: true });
    }

    handleEditModalCancelButtonClick = () => {
        const {
            data,
            title,
        } = this.props;

        this.setState({
            showEditModal: false,
            title,
            informationDateSelected: data.informationDateSelected,
        });
    }

    handleEditModalSaveButtonClick = () => {
        this.setState({ showEditModal: false });
        const { onChange } = this.props;
        const {
            title,
            informationDateSelected,
        } = this.state;
        const data = { informationDateSelected };
        onChange(data, title);
    }

    renderEditModal = () => {
        const {
            showEditModal,
            title: titleValue,
            informationDateSelected,
        } = this.state;

        if (!showEditModal) {
            return null;
        }

        const { afStrings } = this.props;

        const headerTitle = afStrings('editTitleModalHeader');
        const titleInputLabel = afStrings('titleLabel');
        const titleInputPlaceholder = afStrings('widgetTitlePlaceholder');
        const checkboxLabel = afStrings('informationDateCheckboxLabel');
        const cancelButtonLabel = afStrings('cancelButtonLabel');
        const saveButtonLabel = afStrings('saveButtonLabel');

        return (
            <Modal className={styles.editModal}>
                <ModalHeader title={headerTitle} />
                <ModalBody>
                    <TextInput
                        autoFocus
                        label={titleInputLabel}
                        onChange={this.handleWidgetTitleChange}
                        placeholder={titleInputPlaceholder}
                        selectOnFocus
                        showHintAndError={false}
                        value={titleValue}
                    />
                    <Checkbox
                        className={styles.checkbox}
                        onChange={this.handleInformationDataCheck}
                        value={informationDateSelected}
                        label={checkboxLabel}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.handleEditModalCancelButtonClick}>
                        {cancelButtonLabel}
                    </Button>
                    <PrimaryButton onClick={this.handleEditModalSaveButtonClick}>
                        {saveButtonLabel}
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }

    render() {
        const EditModal = this.renderEditModal;

        return (
            <div className={styles.list}>
                <DateInput
                    className={styles.dateInput}
                    showHintAndError={false}
                    disabled
                />
                <EditModal />
            </div>
        );
    }
}
