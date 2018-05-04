import PropTypes from 'prop-types';
import React from 'react';

import {
    randomString,
    isFalsy,
} from '../../../vendor/react-store/utils/common';
import update from '../../../vendor/react-store/utils/immutable-update';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';
import Button from '../../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
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
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: undefined,
};

const baseOrgan = {
    key: 'base',
    title: 'Base',
    organs: [],
};

// TODO: move this later to public
const buildSettings = (indices, action, value, wrapper) => (
    // NOTE: reverse() mutates the array so making a copy
    [...indices].reverse().reduce(
        (acc, selected, index) => wrapper(
            { [selected]: acc },
            indices.length - index - 1,
        ),
        wrapper(
            { [action]: value },
            indices.length,
        ),
    )
);

@BoundError(WidgetError)
export default class Organigram extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showEditModal: false,
            organigram: props.data || baseOrgan,
            title: props.title,
        };

        this.props.editAction(this.handleEditClick);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.data !== nextProps.data) {
            this.setState({ organigram: nextProps.data || baseOrgan });
        }
    }

    getValuesForOrgan = (organ, parentLabel) => {
        const label = parentLabel ? `${parentLabel} / ${organ.title}` : organ.title;
        return [
            {
                key: organ.key,
                label,
            },
            ...organ.organs.reduce((acc, o) => acc.concat(this.getValuesForOrgan(o, label)), []),
        ];
    }

    handleEditClick = () => {
        this.setState({ showEditModal: true });
    }

    handleWidgetTitleChange = (value) => {
        this.setState({ title: value });
    }

    handleModalCancelButtonClick = () => {
        this.setState({
            showEditModal: false,
            organigram: this.props.data || baseOrgan,
            title: this.props.title,
        });
    }

    handleModalSaveButtonClick = () => {
        this.setState({ showEditModal: false });
        this.props.onChange(
            this.state.organigram,
            this.state.title,
        );
    }

    handleAdd = nextIndices => () => {
        const wrapper = e => ({ organs: e });
        const key = `Organ ${randomString()}`;
        const organsSetting = buildSettings(
            nextIndices,
            '$push',
            [{ key, title: '', organs: [] }],
            wrapper,
        );
        const newOrganigram = update(this.state.organigram, organsSetting);
        this.setState({ organigram: newOrganigram });
    };
    handleRemove = (indices, j) => () => {
        const wrapper = e => ({ organs: e });
        const organsSetting = buildSettings(
            indices,
            '$splice',
            [[j, 1]],
            wrapper,
        );
        const newOrganigram = update(this.state.organigram, organsSetting);
        this.setState({ organigram: newOrganigram });
    };
    handleChange = nextIndices => (value) => {
        const wrapper = (e, i) => (
            i === nextIndices.length ? { title: e } : { organs: e }
        );
        const organsSetting = buildSettings(
            nextIndices,
            '$set',
            value,
            wrapper,
        );
        const newOrganigram = update(this.state.organigram, organsSetting);
        this.setState({ organigram: newOrganigram });
    };

    renderOrgan = (organ, indices = [], j) => {
        const isFatherOrgan = isFalsy(j);
        const nextIndices = isFatherOrgan ? indices : [...indices, j];

        const organPlaceholder = _ts('af', 'organPlaceholder');
        const addChildButtonTitle = _ts('af', 'addChildButtonTitle');
        const removeElementButtonTitle = _ts('af', 'removeElementButtonTitle');

        return (
            <div
                className={styles.organ}
                key={organ.key}
            >
                <div className={styles.organHeader}>
                    <TextInput
                        value={organ.title}
                        className={styles.titleInput}
                        showHintAndError={false}
                        placeholder={organPlaceholder}
                        showLabel={false}
                        onChange={this.handleChange(nextIndices)}
                        autoFocus
                    />
                    <div className={styles.actionButtons}>
                        <PrimaryButton
                            className={styles.actionButton}
                            onClick={this.handleAdd(nextIndices)}
                            title={addChildButtonTitle}
                            tabIndex="-1"
                            transparent
                            iconName="ion-fork-repo"
                        />
                        {
                            !isFatherOrgan && (
                                <DangerButton
                                    className={styles.actionButton}
                                    onClick={this.handleRemove(indices, j)}
                                    title={removeElementButtonTitle}
                                    tabIndex="-1"
                                    transparent
                                    iconName="ion-trash-b"
                                />
                            )
                        }
                    </div>
                </div>
                <div className={styles.organBody}>
                    {
                        organ.organs.map(
                            (childOrgan, i) => this.renderOrgan(childOrgan, nextIndices, i),
                        )
                    }
                </div>
            </div>
        );
    };

    renderEditModal = () => {
        const {
            showEditModal,
            organigram,
            title,
        } = this.state;

        if (!showEditModal) {
            return null;
        }

        const headerTitle = _ts('af', 'editOrganigramModaltitle');
        const textInputLabel = _ts('af', 'titleLabel');
        const textInputPlaceholder = _ts('af', 'titlePlaceholderScale');
        const cancelButtonLabel = _ts('af', 'cancelButtonLabel');
        const saveButtonLabel = _ts('af', 'saveButtonLabel');

        return (
            <Modal className={styles.editModal}>
                <ModalHeader title={headerTitle} />
                <ModalBody className={styles.body}>
                    <div className={styles.titleInputContainer}>
                        <TextInput
                            className={styles.titleInput}
                            label={textInputLabel}
                            placeholder={textInputPlaceholder}
                            onChange={this.handleWidgetTitleChange}
                            value={title}
                            showHintAndError={false}
                            autoFocus
                            selectOnFocus
                        />
                    </div>
                    <div className={styles.organs}>
                        { this.renderOrgan(organigram) }
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
        const EditModal = this.renderEditModal;
        const label = _ts('af', 'organigramWidgetLabel');

        return ([
            <div
                key="content"
                className={styles.list}
            >
                { label }
            </div>,
            <EditModal key="modal" />,
        ]);
    }
}
