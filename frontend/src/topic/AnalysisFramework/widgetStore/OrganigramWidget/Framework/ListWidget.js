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

import { afStrings } from '../../../../../common/constants';

import styles from './styles.scss';


const propTypes = {
    title: PropTypes.string.isRequired,
    widgetKey: PropTypes.string.isRequired,
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

    createFilters = (organigram) => {
        const { title, widgetKey } = this.props;
        return [{
            title,
            widgetKey,
            key: widgetKey,
            filterType: 'list',
            properties: {
                type: 'multiselect',
                options: this.getValuesForOrgan(organigram),
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
            this.createFilters(this.state.organigram),
            this.createExportable(),
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
                        placeholder={afStrings.organPlaceholder}
                        showLabel={false}
                        onChange={this.handleChange(nextIndices)}
                    />
                    <div styleName="action-buttons">
                        <TransparentPrimaryButton
                            styleName="action-button"
                            onClick={this.handleAdd(nextIndices)}
                            title={afStrings.addChildButtonTitle}
                            tabIndex="-1"
                        >
                            <span className="ion-fork-repo" />
                        </TransparentPrimaryButton>
                        { !isFatherOrgan &&
                            <TransparentDangerButton
                                styleName="action-button"
                                onClick={this.handleRemove(indices, j)}
                                title={afStrings.removeElementButtonTitle}
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
            title,
        } = this.state;

        return (
            <div styleName="organigram-list">
                { showEditModal &&
                    <Modal styleName="edit-value-modal">
                        <ModalHeader title={afStrings.editOrganigramModaltitle} />
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
                            { this.renderOrgan(organigram) }
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={this.handleModalCancelButtonClick}>
                                {afStrings.cancelButtonLabel}
                            </Button>
                            <PrimaryButton onClick={this.handleModalSaveButtonClick}>
                                {afStrings.saveButtonLabel}
                            </PrimaryButton>
                        </ModalFooter>
                    </Modal>
                }
            </div>
        );
    }
}
