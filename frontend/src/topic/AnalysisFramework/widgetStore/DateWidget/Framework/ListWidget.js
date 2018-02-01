import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    DateInput,
    TextInput,
    Checkbox,
} from '../../../../../public/components/Input';
import {
    Button,
    PrimaryButton,
} from '../../../../../public/components/Action';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '../../../../../public/components/View';
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

const mapStateToProps = state => ({
    afStrings: afStringsSelector(state),
});

@connect(mapStateToProps)
@CSSModules(styles)
export default class DateFrameworkList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showEditModal: false,
            title: props.title,
            informationDateSelected: (props.data || emptyObject).informationDateSelected,
        };

        this.props.editAction(this.handleEdit);
    }

    componentDidMount() {
        const { data, onChange } = this.props;

        onChange(
            data,
            this.createFilters(),
            this.createExportable(),
        );
    }

    createFilters = () => {
        const { title, widgetKey } = this.props;

        return [{
            title,
            widgetKey,
            key: widgetKey,
            filterType: 'number',
            properties: {
                type: 'date',
            },
        }];
    }

    createExportable = () => {
        const excel = {
            title: this.props.title,
        };

        return {
            widgetKey: this.props.widgetKey,
            data: {
                excel,
            },
        };
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

    handleModalCancelButtonClick = () => {
        this.setState({
            showEditModal: false,
            title: this.props.title,
            informationDateSelected: this.props.data.informationDateSelected,
        });
    }

    handleModalSaveButtonClick = () => {
        this.setState({ showEditModal: false });
        const { title, informationDateSelected } = this.state;
        const data = { informationDateSelected };

        this.props.onChange(
            data,
            this.createFilters(),
            this.createExportable(),
            title,
        );
    }

    render() {
        const {
            showEditModal,
            title,
            informationDateSelected,
        } = this.state;

        return (
            <div styleName="date-list">
                <DateInput
                    styleName="date-input"
                    showHintAndError={false}
                    disabled
                />
                { showEditModal &&
                    <Modal>
                        <ModalHeader title={this.props.afStrings('editTitleModalHeader')} />
                        <ModalBody styleName="modal-body">
                            <TextInput
                                label={this.props.afStrings('titleLabel')}
                                placeholder={this.props.afStrings('widgetTitlePlaceholder')}
                                onChange={this.handleWidgetTitleChange}
                                value={title}
                                showHintAndError={false}
                                autoFocus
                                selectOnFocus
                            />
                            <Checkbox
                                styleName="checkbox"
                                onChange={this.handleInformationDataCheck}
                                value={informationDateSelected}
                                label={this.props.afStrings('informationDateCheckboxLabel')}
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
