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

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class ProjectCeForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.elements = [
            'title',
        ];

        this.validations = {
            title: [requiredCondition],
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
                changeCallback={changeCallback}
                elements={this.elements}
                failureCallback={failureCallback}
                styleName="ce-detail-form"
                successCallback={successCallback}
                validation={this.validation}
                validations={this.validations}
                value={formValues}
                error={formFieldErrors}
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
                <NonFieldErrors errors={formErrors} />
                <TextInput
                    label={this.props.projectStrings('addCeTitleLabel')}
                    formname="title"
                    placeholder={this.props.projectStrings('addCeTitlePlaceholder')}
                    styleName="name"
                    disabled={pending}
                    readOnly={readOnly}
                />
            </Form>
        );
    }
}
