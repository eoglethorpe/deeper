import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ModalHeader from '../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../../vendor/react-store/components/View/Modal/Footer';
import Button from '../../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';
import Faram, { requiredCondition } from '../../../vendor/react-store/components/Input/Faram';

import { ceStringsSelector } from '../../../redux';

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

    static schema = {
        fields: {
            title: [requiredCondition],
        },
    };

    constructor(props) {
        super(props);

        const { title = '' } = props.initialValue || {};
        this.state = {
            schema: NewCategoryModal.schema,
            faramErrors: {},
            faramValues: { title },
            pristine: true,
        };
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleFaramValidationSuccess = ({ title }) => {
        this.props.onSubmit(title);
    }

    handleModalClose = () => {
        this.props.onClose();
    }

    render() {
        const { editMode } = this.props;
        const {
            faramErrors,
            faramValues,
            schema,
            pristine,
        } = this.state;

        const title = editMode
            ? this.props.ceStrings('editCategoryTooltip')
            : this.props.ceStrings('addCategoryTooltip');

        return (
            <Faram
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleFaramValidationFailure}
                onValidationSuccess={this.handleFaramValidationSuccess}
                schema={schema}
                value={faramValues}
                error={faramErrors}
            >
                <ModalHeader
                    key="header"
                    title={title}
                />
                <ModalBody key="body">
                    <TextInput
                        faramElementName="title"
                        label={this.props.ceStrings('addCategoryTitleLabel')}
                        placeholder={this.props.ceStrings('addCategoryTitlePlaceholder')}
                        autoFocus
                    />
                </ModalBody>
                <ModalFooter key="footer">
                    <Button onClick={this.handleModalClose} >
                        {this.props.ceStrings('modalCancel')}
                    </Button>
                    <PrimaryButton
                        className={styles.okButton}
                        disabled={pristine}
                        type="submit"
                    >
                        {this.props.ceStrings('modalOk')}
                    </PrimaryButton>
                </ModalFooter>
            </Faram>
        );
    }
}
