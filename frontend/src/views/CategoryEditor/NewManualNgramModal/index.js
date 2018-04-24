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
    ceStrings: PropTypes.func.isRequired,
};

const defaultProps = { };

const mapStateToProps = state => ({
    ceStrings: ceStringsSelector(state),
});

@connect(mapStateToProps)
export default class NewManualNgramModal extends React.PureComponent {
    static defaultProps = defaultProps;
    static propTypes = propTypes;

    static schema = {
        fields: {
            word: [requiredCondition],
        },
    };

    constructor(props) {
        super(props);
        this.state = {
            schema: NewManualNgramModal.schema,
            faramErrors: {},
            faramValues: {},
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

    handleFaramValidationSuccess = ({ word }) => {
        this.props.onSubmit(word);
    }

    handleModalClose = () => {
        this.props.onClose();
    }

    render() {
        const {
            faramErrors,
            faramValues,
            schema,
            pristine,
        } = this.state;

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
                    title={this.props.ceStrings('addNewWordModalTitle')}
                />
                <ModalBody key="body">
                    <TextInput
                        faramElementName="word"
                        label={this.props.ceStrings('addNewWordLabel')}
                        placeholder={this.props.ceStrings('addNewWordPlaceholder')}
                        autoFocus
                    />
                </ModalBody>
                <ModalFooter key="footer">
                    <Button onClick={this.handleModalClose}>
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
