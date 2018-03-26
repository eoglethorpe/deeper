import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import TextInput from '../../../vendor/react-store/components/Input/TextInput';
import Button from '../../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import Modal from '../../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../../vendor/react-store/components/View/Modal/Footer';

import { afStringsSelector } from '../../../redux';
import BoundError from '../../../components/BoundError';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    afStrings: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    afStrings: afStringsSelector(state),
});

@BoundError
@connect(mapStateToProps)
export default class ExcerptTextOverview extends React.PureComponent {
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

    handleModalCancelButtonClick = () => {
        const { title } = this.props;
        this.setState({
            showEditModal: false,
            title,
        });
    }

    handleModalSaveButtonClick = () => {
        this.setState({ showEditModal: false });
        const { title } = this.state;

        this.props.onChange(
            undefined,
            title,
        );
    }

    renderEditModal = () => {
        const {
            showEditModal,
            title,
        } = this.state;

        if (!showEditModal) {
            return null;
        }

        const { afStrings } = this.props;
        const headerTitle = afStrings('editTitleModalHeader');
        const cancelButtonLabel = afStrings('cancelButtonLabel');
        const saveButtonLabel = afStrings('saveButtonLabel');

        return (
            <Modal className={styles.editOverviewModal}>
                <ModalHeader title={headerTitle} />
                <ModalBody>
                    <TextInput
                        autoFocus
                        label={this.props.afStrings('titleLabel')}
                        onChange={this.handleWidgetTitleChange}
                        placeholder={this.props.afStrings('widgetTitlePlaceholder')}
                        selectOnFocus
                        showHintAndError={false}
                        value={title}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.handleModalCancelButtonClick}>
                        {cancelButtonLabel}
                    </Button>
                    <PrimaryButton onClick={this.handleModalSaveButtonClick}>
                        {saveButtonLabel}
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }

    render() {
        const { afStrings } = this.props;
        const EditModal = this.renderEditModal;
        const contentText = afStrings('textOrImageExcerptWidgetLabel');

        return [
            <div
                key="content"
                className={styles.overview}
            >
                {contentText}
            </div>,
            <EditModal key="modal" />,
        ];
    }
}
