import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '../../../../../../vendor/react-store/components/Action/Button/DangerButton';
import SuccessButton from '../../../../../../vendor/react-store/components/Action/Button/SuccessButton';
import NonFieldErrors from '../../../../../../vendor/react-store/components/Input/NonFieldErrors';
import TextInput from '../../../../../../vendor/react-store/components/Input/TextInput';
import Form, {
    requiredCondition,
} from '../../../../../../vendor/react-store/components/Input/Form';

import _ts from '../../../../../../ts';

import styles from './styles.scss';

const propTypes = {
    changeCallback: PropTypes.func.isRequired,
    failureCallback: PropTypes.func.isRequired,
    formErrors: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    formFieldErrors: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    formValues: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    handleFormCancel: PropTypes.func.isRequired,
    successCallback: PropTypes.func.isRequired,
    pending: PropTypes.bool,
    pristine: PropTypes.bool,
    readOnly: PropTypes.bool,
};

const defaultProps = {
    pending: false,
    pristine: false,
    className: '',
    readOnly: false,
};

// FIXME: Unnecessary component, not reused
export default class ProjectCeForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.schema = {
            fields: {
                title: [requiredCondition],
            },
        };
    }

    render() {
        const {
            changeCallback,
            failureCallback,
            formErrors,
            formFieldErrors,
            formValues,
            handleFormCancel,
            pending,
            pristine,
            successCallback,
            readOnly,
        } = this.props;

        return (
            <Form
                className={styles.ceDetailForm}
                changeCallback={changeCallback}
                failureCallback={failureCallback}
                successCallback={successCallback}
                schema={this.schema}
                value={formValues}
                formErrors={formErrors}
                fieldErrors={formFieldErrors}
                disabled={pending}
            >
                { !readOnly &&
                    <div className={styles.actionButtons}>
                        <DangerButton
                            onClick={handleFormCancel}
                            disabled={pending || !pristine}
                        >
                            {_ts('project', 'modalRevert')}
                        </DangerButton>
                        <SuccessButton
                            disabled={pending || !pristine}
                            type="submit"
                        >
                            {_ts('project', 'modalSave')}
                        </SuccessButton>
                    </div>
                }
                <NonFieldErrors errorname="" />
                <TextInput
                    label={_ts('project', 'addCeTitleLabel')}
                    formname="title"
                    placeholder={_ts('project', 'addCeTitlePlaceholder')}
                    className={styles.name}
                    readOnly={readOnly}
                />
            </Form>
        );
    }
}
