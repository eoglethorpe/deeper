import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { randomString } from '../../../../../public/utils/common';
import update from '../../../../../public/utils/immutable-update';
import TextInput from '../../../../../public/components/Input/TextInput';
import Button from '../../../../../public/components/Action/Button';
import PrimaryButton from '../../../../../public/components/Action/Button/PrimaryButton';
import Modal from '../../../../../public/components/View/Modal';
import ModalHeader from '../../../../../public/components/View/Modal/Header';
import ModalBody from '../../../../../public/components/View/Modal/Body';
import ModalFooter from '../../../../../public/components/View/Modal/Footer';
import ListView from '../../../../../public/components/View/List/ListView';
import DangerButton from '../../../../../public/components/Action/Button/DangerButton';
import MultiSelectInput from '../../../../../public/components/Input/SelectInput/MultiSelectInput';

import { iconNames } from '../../../../../common/constants';
import { afStringsSelector } from '../../../../../common/redux';

import styles from './styles.scss';


const propTypes = {
    title: PropTypes.string.isRequired,
    widgetKey: PropTypes.string.isRequired,
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    afStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    data: {},
};

const emptyObject = {};
const emptyList = [];

const mapStateToProps = state => ({
    afStrings: afStringsSelector(state),
});

@connect(mapStateToProps)
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
                label={this.props.afStrings('optionLabel')}
                placeholder={this.props.afStrings('optionPlaceholder')}
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
                            title={this.props.afStrings('editMultiselectModalTitle')}
                            rightComponent={
                                <PrimaryButton
                                    onClick={this.handleAddOptionButtonClick}
                                    transparent
                                >
                                    {this.props.afStrings('addOptionButtonLabel')}
                                </PrimaryButton>
                            }
                        />
                        <ModalBody styleName="modal-body">
                            <div styleName="general-info-container">
                                <TextInput
                                    className={styles['title-input']}
                                    label={this.props.afStrings('titleLabel')}
                                    placeholder={this.props.afStrings('titlePlaceholderScale')}
                                    onChange={this.handleWidgetTitleChange}
                                    value={title}
                                    showHintAndError={false}
                                    autoFocus
                                    selectOnFocus
                                />
                            </div>
                            <header styleName="header">
                                <h3>
                                    {this.props.afStrings('optionsHeader')}
                                </h3>
                            </header>
                            <ListView
                                data={options}
                                className={styles['value-list']}
                                keyExtractor={Multiselect.valueKeyExtractor}
                                modifier={this.getEditValue}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={this.handleModalCancelButtonClick}>
                                {this.props.afStrings('cancelButtonLabel')}
                            </Button>
                            <PrimaryButton onClick={this.handleModalSaveButtonClick}>
                                {this.props.afStrings('saveButtonLabel')}
                            </PrimaryButton>
                        </ModalFooter>
                    </Modal>
                }
            </div>
        );
    }
}
