import PropTypes from 'prop-types';
import React from 'react';

import { randomString } from '../../../vendor/react-store/utils/common';
import update from '../../../vendor/react-store/utils/immutable-update';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';
import Button from '../../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import AccentButton from '../../../vendor/react-store/components/Action/Button/AccentButton';
import Modal from '../../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../../vendor/react-store/components/View/Modal/Footer';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import MultiSelectInput from '../../../vendor/react-store/components/Input/MultiSelectInput';
import SortableList from '../../../vendor/react-store/components/View/SortableList';
import BoundError from '../../../vendor/react-store/components/General/BoundError';

import _ts from '../../../ts';
import { iconNames } from '../../../constants';
import WidgetError from '../../../components/WidgetError';

import styles from './styles.scss';


const propTypes = {
    title: PropTypes.string.isRequired,
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: {},
};

const emptyObject = {};
const emptyList = [];

@BoundError(WidgetError)
export default class Multiselect extends React.PureComponent {
    static valueKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            title,
            data,
            editAction,
        } = this.props;
        const options = data.options || emptyList;

        this.state = {
            showEditModal: false,
            title,
            options,
        };

        editAction(this.handleEdit);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.data !== nextProps.data) {
            const options = (nextProps.data || emptyObject).options;
            this.setState({ options });
        }
    }

    handleEdit = () => {
        this.setState({ showEditModal: true });
    }

    handleOptionOrderChange = (newOptions) => {
        this.setState({ options: newOptions });
    }

    handleWidgetTitleChange = (value) => {
        this.setState({ title: value });
    }

    handleRemoveButtonClick = (key) => {
        const options = this.state.options.filter(d => d.key !== key);
        this.setState({ options });
    }

    handleValueInputChange = (key, value) => {
        const valueIndex = this.state.options.findIndex(d => d.key === key);
        const settings = {
            [valueIndex]: {
                label: { $set: value },
            },
        };
        const options = update(this.state.options, settings);

        this.setState({ options });
    }

    handleAddOptionButtonClick = () => {
        const newOption = {
            key: randomString(16).toLowerCase(),
            label: '',
        };

        this.setState({
            options: [
                ...this.state.options,
                newOption,
            ],
        });
    }

    handleModalCancelButtonClick = () => {
        this.setState({
            showEditModal: false,
            options: this.props.data.options,
            title: this.props.title,
        });
    }

    handleModalSaveButtonClick = () => {
        this.setState({ showEditModal: false });
        const { options } = this.state;
        const { data } = this.props;

        const newData = {
            ...data,
            options,
        };

        this.props.onChange(
            newData,
            this.state.title,
        );
    }

    renderEditOption = (key, data) => (
        <div
            className={styles.editOption}
            key={key}
        >
            <TextInput
                className={styles.titleInput}
                label={_ts('af', 'optionLabel')}
                placeholder={_ts('af', 'optionPlaceholder')}
                onChange={(value) => { this.handleValueInputChange(key, value); }}
                showHintAndError={false}
                value={data.label}
                autoFocus
            />
            <DangerButton
                className={styles.deleteButton}
                onClick={() => { this.handleRemoveButtonClick(key); }}
                transparent
            >
                <span className={iconNames.delete} />
            </DangerButton>
        </div>
    )

    renderDragHandle = () => {
        const dragStyle = [styles.dragHandle];
        return (
            <span className={`${iconNames.hamburger} ${dragStyle.join(' ')}`} />
        );
    };

    renderEditModal = () => {
        const {
            showEditModal,
            options,
            title,
        } = this.state;

        if (!showEditModal) {
            return null;
        }

        const headerTitle = _ts('af', 'editMultiselectModalTitle');
        const titleInputLabel = _ts('af', 'titleLabel');
        const titleInputPlaceholder = _ts('af', 'titlePlaceholderScale');
        const optionsTitle = _ts('af', 'optionsHeader');
        const addOptionButtonLabel = _ts('af', 'addOptionButtonLabel');
        const cancelButtonLabel = _ts('af', 'cancelButtonLabel');
        const saveButtonLabel = _ts('af', 'saveButtonLabel');

        return (
            <Modal className={styles.editModal}>
                <ModalHeader title={headerTitle} />
                <ModalBody className={styles.body}>
                    <div className={styles.titleInputContainer}>
                        <TextInput
                            className={styles.titleInput}
                            label={titleInputLabel}
                            placeholder={titleInputPlaceholder}
                            onChange={this.handleWidgetTitleChange}
                            value={title}
                            showHintAndError={false}
                            autoFocus
                            selectOnFocus
                        />
                    </div>
                    <div className={styles.optionInputs}>
                        <header className={styles.header}>
                            <h4>
                                { optionsTitle }
                            </h4>
                            <AccentButton
                                onClick={this.handleAddOptionButtonClick}
                                transparent
                            >
                                { addOptionButtonLabel }
                            </AccentButton>
                        </header>
                        <SortableList
                            className={styles.editOptionList}
                            data={options}
                            modifier={this.renderEditOption}
                            onChange={this.handleOptionOrderChange}
                            sortableItemClass={styles.sortableUnit}
                            keyExtractor={Multiselect.valueKeyExtractor}
                            dragHandleModifier={this.renderDragHandle}
                        />
                    </div>
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
        const { options } = this.state;
        const EditModal = this.renderEditModal;

        return (
            <div className={styles.list}>
                <MultiSelectInput
                    className={styles.input}
                    options={options}
                    keyExtractor={Multiselect.valueKeyExtractor}
                    disabled
                />
                <EditModal />
            </div>
        );
    }
}
