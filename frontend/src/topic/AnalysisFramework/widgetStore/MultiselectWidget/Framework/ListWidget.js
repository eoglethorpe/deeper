import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    MultiSelectInput,
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
            title: props.title,
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
                label={afStrings.optionLabel}
                placeholder={afStrings.optionPlaceholder}
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

    createFilters = (values) => {
        const { title, widgetKey } = this.props;
        return [{
            title,
            widgetKey,
            key: widgetKey,
            filterType: 'list',
            properties: {
                type: 'multiselect',
                options: values,
            },
        }];
    }

    createExportable = () => {
        const { title, widgetKey } = this.props;

        const excel = {
            title,
        };

        return {
            widgetKey,
            data: {
                excel,
            },
        };
    }

    handleEdit = () => {
        this.setState({ showEditModal: true });
    }

    handleWidgetTitleChange = (value) => {
        this.setState({ title: value });
    }

    handleRemoveButtonClick = (key) => {
        const newValues = this.state.values.filter(d => d.key !== key);
        this.setState({ values: newValues });
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

    handleModalCancelButtonClick = () => {
        this.setState({
            showEditModal: false,
            values: this.props.data,
            title: this.props.title,
        });
    }

    handleModalSaveButtonClick = () => {
        this.setState({ showEditModal: false });

        this.props.onChange(
            this.state.values,
            this.createFilters(this.state.values),
            this.createExportable(),
            this.state.title,
        );
    }

    render() {
        const {
            showEditModal,
            values,
            title,
        } = this.state;

        return (
            <div styleName="multiselect-list">
                <MultiSelectInput
                    options={values}
                    styleName="multiselect"
                    keyExtractor={Multiselect.valueKeyExtractor}
                    disabled
                />
                { showEditModal &&
                    <Modal
                        styleName="edit-value-modal"
                    >
                        <ModalHeader
                            title={afStrings.editMultiselectModalTitle}
                            rightComponent={
                                <TransparentPrimaryButton
                                    onClick={this.handleAddOptionButtonClick}
                                >
                                    {afStrings.addOptionButtonLabel}
                                </TransparentPrimaryButton>
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
                                />
                            </div>
                            <header styleName="header">
                                <h3>{afStrings.optionsHeader}</h3>
                            </header>
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
