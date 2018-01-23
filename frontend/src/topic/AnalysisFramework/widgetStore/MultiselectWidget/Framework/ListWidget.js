import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    MultiSelectInput,
    TextInput,
} from '../../../../../public/components/Input';
import {
    Button,
    DangerButton,
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
import {
    iconNames,
    afStrings,
} from '../../../../../common/constants';

import styles from './styles.scss';


const propTypes = {
    title: PropTypes.string.isRequired,
    widgetKey: PropTypes.string.isRequired,
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: {},
};

const emptyObject = {};
const emptyList = [];

@CSSModules(styles)
export default class Multiselect extends React.PureComponent {
    static valueKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const options = props.data.options || emptyList;
        this.state = {
            showEditModal: false,
            title: props.title,
            options,
        };

        this.props.editAction(this.handleEdit);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.data !== nextProps.data) {
            const options = (nextProps.data || emptyObject).options;
            this.setState({ options });
        }
    }

    getEditValue = (key, data) => (
        <div
            className={styles['edit-value']}
            key={key}
        >
            <TextInput
                className={styles['title-input']}
                label={afStrings.optionLabel}
                placeholder={afStrings.optionPlaceholder}
                onChange={(value) => { this.handleValueInputChange(key, value); }}
                value={data.label}
                autoFocus
            />
            <DangerButton
                className={styles['delete-button']}
                onClick={() => { this.handleRemoveButtonClick(key); }}
                transparent
            >
                <span className={iconNames.delete} />
            </DangerButton>
        </div>
    )

    createFilters = (newOptions) => {
        const { title, widgetKey } = this.props;
        return [{
            title,
            widgetKey,
            key: widgetKey,
            filterType: 'list',
            properties: {
                type: 'multiselect',
                options: newOptions,
            },
        }];
    }

    createExportable = () => {
        const { title, widgetKey } = this.props;

        const excel = { title };

        return {
            widgetKey,
            data: { excel },
        };
    }

    handleEdit = () => {
        this.setState({ showEditModal: true });
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
        const newData = {
            ...this.props.data,
            options,
        };

        this.props.onChange(
            newData,
            this.createFilters(this.state.options),
            this.createExportable(),
            this.state.title,
        );
    }

    render() {
        const {
            showEditModal,
            options,
            title,
        } = this.state;

        return (
            <div styleName="multiselect-list">
                <MultiSelectInput
                    options={options}
                    styleName="multiselect"
                    keyExtractor={Multiselect.valueKeyExtractor}
                    disabled
                />
                { showEditModal &&
                    <Modal styleName="edit-value-modal">
                        <ModalHeader
                            title={afStrings.editMultiselectModalTitle}
                            rightComponent={
                                <PrimaryButton
                                    onClick={this.handleAddOptionButtonClick}
                                    transparent
                                >
                                    {afStrings.addOptionButtonLabel}
                                </PrimaryButton>
                            }
                        />
                        <ModalBody styleName="modal-body">
                            <div styleName="general-info-container">
                                <TextInput
                                    className={styles['title-input']}
                                    label={afStrings.titleLabel}
                                    placeholder={afStrings.titlePlaceholderScale}
                                    onChange={this.handleWidgetTitleChange}
                                    value={title}
                                    showHintAndError={false}
                                    autoFocus
                                    selectOnFocus
                                />
                            </div>
                            <header styleName="header">
                                <h3>{afStrings.optionsHeader}</h3>
                            </header>
                            <ListView
                                data={options}
                                className={styles['value-list']}
                                keyExtractor={Multiselect.valueKeyExtractor}
                                modifier={this.getEditValue}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                onClick={this.handleModalCancelButtonClick}
                            >
                                {afStrings.cancelButtonLabel}
                            </Button>
                            <PrimaryButton
                                onClick={this.handleModalSaveButtonClick}
                            >
                                {afStrings.saveButtonLabel}
                            </PrimaryButton>
                        </ModalFooter>
                    </Modal>
                }
            </div>
        );
    }
}
