import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import { DangerButton, SuccessButton } from '../../../../public/components/Button';
import TextInput from '../../../../public/components/TextInput';

const propTypes = {
    adminLevelDetail: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.name,
        nameProperty: PropTypes.string,
        pcodeProperty: PropTypes.string,
        parentNameProperty: PropTypes.string,
        parentPcodeProperty: PropTypes.string,
    }),
    onClose: PropTypes.func.isRequired,
};

const defaultProps = {
    adminLevelDetail: {
        id: 1,
        name: '',
        nameProperty: '',
        pcodeProperty: '',
        parentNameProperty: '',
        parentPcodeProperty: '',
    },
};


@CSSModules(styles)
export default class EditAdminLevelForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    saveAdminLevel = () => {
        // Save Admin Level Code Goes Here
    }
    deleteAdminLevel = () => {
        // Delete Admin Level Code Goes Here
    }

    render() {
        const { adminLevelDetail, onClose } = this.props;

        return (
            <div styleName="form-container">
                <form styleName="edit-admin-level-form">
                    <div
                        styleName="admin-level-details"
                    >
                        <TextInput
                            initialValue={adminLevelDetail.level}
                            label="Admin level"
                            placeholder="Admin level"
                            styleName="text-input"
                        />
                        <TextInput
                            initialValue={adminLevelDetail.name}
                            label="Admin level name"
                            placeholder="Country"
                            styleName="text-input"
                        />
                        <TextInput
                            initialValue={adminLevelDetail.nameProperty}
                            label="Name property"
                            placeholder="NAME_ENGL"
                            styleName="text-input"
                        />
                        <TextInput
                            initialValue={adminLevelDetail.pcodeProperty}
                            label="Pcode property"
                            placeholder="NAME_PCODE"
                            styleName="text-input"
                        />
                        <TextInput
                            initialValue={adminLevelDetail.parentNameProperty}
                            label="Parent name property"
                            placeholder="NAME_ENFG"
                            styleName="text-input"
                        />
                        <TextInput
                            initialValue={adminLevelDetail.parentPcodeProperty}
                            label="Parent pcode property"
                            placeholder="NAME_PPCODE"
                            styleName="text-input"
                        />
                    </div>
                </form>
                <div styleName="action-buttons">
                    <DangerButton onClick={onClose}>
                        Cancel
                    </DangerButton>
                    <div>
                        <DangerButton onClick={this.deleteAdminLevel}>
                            Delete Admin Level
                        </DangerButton>
                        <SuccessButton onClick={this.saveAdminLevel}>
                            Save Changes
                        </SuccessButton>
                    </div>
                </div>
            </div>
        );
    }
}
