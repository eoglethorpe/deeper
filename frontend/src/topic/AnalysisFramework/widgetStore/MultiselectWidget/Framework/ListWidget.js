import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    SelectInput,
} from '../../../../../public/components/Input';
import {
    TransparentPrimaryButton,
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
import { iconNames } from '../../../../../common/constants';

import styles from './styles.scss';


const propTypes = {
    editAction: PropTypes.func.isRequired,
};

@CSSModules(styles)
export default class Multiselect extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.state = {
            showEditModal: false,
        };
        this.props.editAction(this.handleEdit);
    }

    handleEdit = () => {
        this.setState({ showEditModal: true });
    }

    handleChange = () => {
        console.log('change');
    }

    handleAddOptionButtonClick = () => {

    }

    handleEditModalClose = () => {
        this.setState({ showEditModal: false });
    }

    handleModalCancelButtonClick = () => {
        this.setState({
            showEditModal: false,
        });
    }

    handleModalSaveButtonClick = () => {
    }

    render() {
        const {
            showEditModal,
        } = this.state;

        return (
            <div styleName="multiselect-list">
                <SelectInput
                    styleName="multiselect"
                />
                <Modal
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
                        Body
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
