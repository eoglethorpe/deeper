import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ModalHeader from '../../../../public/components/View/Modal/Header';
import ModalBody from '../../../../public/components/View/Modal/Body';
import ModalFooter from '../../../../public/components/View/Modal/Footer';
import Button from '../../../../public/components/Action/Button';
import PrimaryButton from '../../../../public/components/Action/Button/PrimaryButton';
import TextInput from '../../../../public/components/Input/TextInput';

import { ceStringsSelector } from '../../../../common/redux';

import styles from '../styles.scss';

const propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    editMode: PropTypes.bool,
    initialValue: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    ceStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    editMode: false,
    initialValue: {},
};

const mapStateToProps = state => ({
    ceStrings: ceStringsSelector(state),
});

@connect(mapStateToProps)
export default class NewCategoryModal extends React.PureComponent {
    static defaultProps = defaultProps;
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        const { title: titleValue = '' } = props.initialValue || {};
        this.state = {
            showModal: false,
            titleValue,
        };
    }

    handleTitleValueChange = (value) => {
        this.setState({
            titleValue: value,
        });
    }

    handleModalClose = () => {
        this.props.onClose();
    }

    handleModalOk = () => {
        this.props.onSubmit(this.state.titleValue);
    }

    render() {
        const { editMode } = this.props;
        const title = editMode
            ? this.props.ceStrings('editCategoryTooltip')
            : this.props.ceStrings('addCategoryTooltip');
        return ([
            <ModalHeader
                key="header"
                title={title}
            />,
            <ModalBody key="body">
                <TextInput
                    autoFocus
                    label={this.props.ceStrings('addCategoryTitleLabel')}
                    placeholder={this.props.ceStrings('addCategoryTitlePlaceholder')}
                    onChange={this.handleTitleValueChange}
                    value={this.state.titleValue}
                />
            </ModalBody>,
            <ModalFooter key="footer">
                <Button onClick={this.handleModalClose} >
                    {this.props.ceStrings('modalCancel')}
                </Button>
                <PrimaryButton
                    onClick={this.handleModalOk}
                    className={styles['ok-button']}
                >
                    {this.props.ceStrings('modalOk')}
                </PrimaryButton>
            </ModalFooter>,
        ]);
    }
}
