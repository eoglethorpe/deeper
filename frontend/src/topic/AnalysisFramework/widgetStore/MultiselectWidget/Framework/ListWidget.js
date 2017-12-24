import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    SelectInput,
    TextInput,
} from '../../../../../public/components/Input';
import {
    TransparentPrimaryButton,
    TransparentDangerButton,
    Button,
    PrimaryButton,
} from '../../../../../public/components/Action';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ListView,
} from '../../../../../public/components/View';
import { randomString } from '../../../../../public/utils/common';
import update from '../../../../../public/utils/immutable-update';
import { iconNames } from '../../../../../common/constants';

import styles from './styles.scss';


const propTypes = {
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    data: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: [],
};

const emptyList = [];

@CSSModules(styles)
export default class Multiselect extends React.PureComponent {
    static valueKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showEditModal: false,
            values: props.data || emptyList,
        };
        this.props.editAction(this.handleEdit);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.data !== nextProps.data) {
            this.setState({
                values: nextProps.data || emptyList,
            });
        }
    }

    getEditValue = (key, data) => (
        <div
            className={styles['edit-value']}
            key={key}
        >
            <TextInput
                className={styles['title-input']}
                label="Option"
                placeholder="eg: Context"
                onChange={(value) => { this.handleValueInputChange(key, value); }}
                value={data.label}
            />
            <TransparentDangerButton
                className={styles['delete-button']}
                onClick={() => { this.handleRemoveButtonClick(key); }}
            >
                <span className={iconNames.delete} />
            </TransparentDangerButton>
        </div>
    )

    handleEdit = () => {
        this.setState({ showEditModal: true });
    }

    handleRemoveButtonClick = (key) => {
        const newValues = this.state.values.filter(d => d.key !== key);
        this.setState({
            values: newValues,
        });
    }

    handleValueInputChange = (key, value) => {
        const valueIndex = this.state.values.findIndex(d => d.key === key);
        const settings = {
            [valueIndex]: {
                label: { $set: value },
            },
        };
        const newValues = update(this.state.values, settings);
        this.setState({
            values: newValues,
        });
    }
    handleAddOptionButtonClick = () => {
        const newValue = {
            key: randomString(16).toLowerCase(),
            label: '',
        };

        this.setState({
            values: [
                ...this.state.values,
                newValue,
            ],
        });
    }

    handleEditModalClose = () => {
        this.setState({ showEditModal: false });
    }

    handleModalCancelButtonClick = () => {
        this.setState({
            showEditModal: false,
            values: this.props.data,
        });
    }

    handleModalSaveButtonClick = () => {
        this.setState({
            showEditModal: false,
        });

        this.props.onChange(this.state.values);
    }

    render() {
        const {
            showEditModal,
            values,
        } = this.state;

        return (
            <div styleName="multiselect-list">
                <SelectInput
                    options={values}
                    multiple
                    styleName="multiselect"
                    keyExtractor={Multiselect.valueKeyExtractor}
                />
                <Modal
                    styleName="edit-value-modal"
                    show={showEditModal}
                    onClose={this.handleEditModalClose}
                >
                    <ModalHeader
                        title="Edit Multiselect"
                        rightComponent={
                            <TransparentPrimaryButton
                                onClick={this.handleAddOptionButtonClick}
                            >
                                Add Option
                            </TransparentPrimaryButton>
                        }
                    />
                    <ModalBody>
                        <ListView
                            data={values}
                            className={styles['value-list']}
                            keyExtractor={Multiselect.valueKeyExtractor}
                            modifier={this.getEditValue}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            onClick={this.handleModalCancelButtonClick}
                        >
                            Cancel
                        </Button>
                        <PrimaryButton
                            onClick={this.handleModalSaveButtonClick}
                        >
                            Save
                        </PrimaryButton>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
