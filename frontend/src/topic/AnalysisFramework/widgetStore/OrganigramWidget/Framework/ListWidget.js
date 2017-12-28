import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    Button,
    PrimaryButton,
    TransparentPrimaryButton,
    TransparentDangerButton,
} from '../../../../../public/components/Action';
import {
    TextInput,
} from '../../../../../public/components/Input';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '../../../../../public/components/View';
import {
    randomString,
    isFalsy,
} from '../../../../../public/utils/common';
import update from '../../../../../public/utils/immutable-update';

// import { iconNames } from '../../../../../common/constants';

import styles from './styles.scss';


const propTypes = {
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

@CSSModules(styles)
export default class Organigram extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showEditModal: false,
            organigram: props.data || baseOrgan,
        };

        this.props.editAction(this.handleEditClick);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.data !== nextProps.data) {
            this.setState({ organigram: nextProps.data || baseOrgan });
        }
    }

    handleEditClick = () => {
        this.setState({ showEditModal: true });
    }

    handleEditModalClose = () => {
        this.setState({ showEditModal: false });
    }

    handleModalCancelButtonClick = () => {
        this.setState({
            showEditModal: false,
            organigram: this.props.data || baseOrgan,
        });
    }

    handleModalSaveButtonClick = () => {
        this.setState({ showEditModal: false });
        this.props.onChange(this.state.organigram);
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
        console.log(organsSetting);
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
        return (
            <div
                styleName="organ"
                key={organ.key}
            >
                <div styleName="organ-header">
                    <TextInput
                        value={organ.title}
                        styleName="title-input"
                        showHintAndError={false}
                        placeholder="Organ"
                        showLabel={false}
                        disabled={isFatherOrgan}
                        onChange={this.handleChange(nextIndices)}
                    />
                    <div styleName="action-buttons">
                        <TransparentPrimaryButton
                            styleName="action-button"
                            onClick={this.handleAdd(nextIndices)}
                            title="Add child"
                            tabIndex="-1"
                        >
                            <span className="ion-fork-repo" />
                        </TransparentPrimaryButton>
                        { !isFatherOrgan &&
                            <TransparentDangerButton
                                styleName="action-button"
                                onClick={this.handleRemove(indices, j)}
                                title="Remove"
                                tabIndex="-1"
                            >
                                <span className="ion-trash-b" />
                            </TransparentDangerButton>
                        }
                    </div>
                </div>
                <div styleName="organ-body">
                    {
                        organ.organs.map(
                            (childOrgan, i) => this.renderOrgan(childOrgan, nextIndices, i),
                        )
                    }
                </div>
            </div>
        );
    };


    render() {
        const {
            showEditModal,
            organigram,
        } = this.state;

        return (
            <div styleName="organigram-list">
                <Modal
                    styleName="edit-value-modal"
                    show={showEditModal}
                    onClose={this.handleEditModalClose}
                >
                    <ModalHeader title="Edit Organigram" />
                    <ModalBody>
                        { this.renderOrgan(organigram) }
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={this.handleModalCancelButtonClick}>
                            Cancel
                        </Button>
                        <PrimaryButton onClick={this.handleModalSaveButtonClick}>
                            Save
                        </PrimaryButton>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
