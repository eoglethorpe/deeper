import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import DangerButton from '../../../../../../vendor/react-store/components/Action/Button/DangerButton';
import SuccessButton from '../../../../../../vendor/react-store/components/Action/Button/SuccessButton';
import NonFieldErrors from '../../../../../../vendor/react-store/components/Input/NonFieldErrors';
import TextInput from '../../../../../../vendor/react-store/components/Input/TextInput';
import Form, {
    requiredCondition,
} from '../../../../../../vendor/react-store/components/Input/Form';

import { projectStringsSelector } from '../../../../../../redux';

import styles from './styles.scss';

const propTypes = {
    changeCallback: PropTypes.func.isRequired,
    failureCallback: PropTypes.func.isRequired,
    formErrors: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    formFieldErrors: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    formValues: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    handleFormCancel: PropTypes.func.isRequired,
    successCallback: PropTypes.func.isRequired,
    pending: PropTypes.bool,
    pristine: PropTypes.bool,
    readOnly: PropTypes.bool,
    projectStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    pending: false,
    pristine: false,
    className: '',
    readOnly: false,
};

const mapStateToProps = state => ({
    projectStrings: projectStringsSelector(state),
});

// FIMXE: Unnecessary component, not reused
@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
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
                styleName="ce-detail-form"
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
                    <div styleName="action-buttons">
                        <DangerButton
                            onClick={handleFormCancel}
                            type="button"
                            disabled={pending || !pristine}
                        >
                            {this.props.projectStrings('modalRevert')}
                        </DangerButton>
                        <SuccessButton
                            disabled={pending || !pristine}
                        >
                            {this.props.projectStrings('modalSave')}
                        </SuccessButton>
                    </div>
                }
                <NonFieldErrors errorname="" />
                <TextInput
                    label={this.props.projectStrings('addCeTitleLabel')}
                    formname="title"
                    placeholder={this.props.projectStrings('addCeTitlePlaceholder')}
                    styleName="name"
                    readOnly={readOnly}
                />
            </Form>
        );
    }
}
