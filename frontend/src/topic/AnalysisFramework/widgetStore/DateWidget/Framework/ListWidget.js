import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    DateInput,
    TextInput,
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
import { afStrings } from '../../../../../common/constants';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    widgetKey: PropTypes.string.isRequired,
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
};

@CSSModules(styles)
export default class DateFrameworkList extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.state = {
            showEditModal: false,
            title: props.title,
        };

        this.props.editAction(this.handleEdit);
    }

    componentDidMount() {
        const { onChange } = this.props;

        onChange(
            undefined,
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

    handleEdit = () => {
        this.setState({ showEditModal: true });
    }

    handleModalCancelButtonClick = () => {
        this.setState({
            showEditModal: false,
            title: this.props.title,
        });
    }

    handleModalSaveButtonClick = () => {
        this.setState({ showEditModal: false });
        const { title } = this.state;

        this.props.onChange(
            undefined,
            this.createFilters(),
            this.createExportable(),
            title,
        );
    }

    render() {
        const { showEditModal, title } = this.state;

        return (
            <div styleName="date-list">
                <DateInput
                    styleName="date-input"
                    showHintAndError={false}
                    disabled
                />
                <Modal show={showEditModal}>
                    <ModalHeader
                        title={afStrings.editTitleModalHeader}
                    />
                    <ModalBody>
                        <TextInput
                            label={afStrings.titleLabel}
                            placeholder={afStrings.widgetTitlePlaceholder}
                            onChange={this.handleWidgetTitleChange}
                            value={title}
                            showHintAndError={false}
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
            </div>
        );
    }
}
