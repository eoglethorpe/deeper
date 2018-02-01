import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
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
import { afStringsSelector } from '../../../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    afStrings: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    afStrings: afStringsSelector(state),
});

@connect(mapStateToProps)
@CSSModules(styles)
export default class ExcerptTextOverview extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.state = {
            showEditModal: false,
            title: props.title,
        };

        this.props.editAction(this.handleEdit);
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
            undefined,
            undefined,
            title,
        );
    }

    render() {
        const { showEditModal, title } = this.state;

        return (
            <div styleName="excerpt-overview">
                {this.props.afStrings('textOrImageExcerptWidgetLabel')}
                { showEditModal &&
                    <Modal>
                        <ModalHeader title={this.props.afStrings('editTitleModalHeader')} />
                        <ModalBody>
                            <TextInput
                                label={this.props.afStrings('titleLabel')}
                                placeholder={this.props.afStrings('widgetTitlePlaceholder')}
                                onChange={this.handleWidgetTitleChange}
                                value={title}
                                showHintAndError={false}
                                autoFocus
                                selectOnFocus
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
