import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import { PrimaryButton } from '../../../../public/components/Button';
import TextInput from '../../../../public/components/TextInput';

import Form, {
    requiredCondition,
    emailCondition,
    lengthGreaterThanCondition,
} from '../../../../public/utils/Form';
import BaseForm from './BaseForm';

const propTypes = {
    formError: PropTypes.array, // eslint-disable-line
    formErrors: PropTypes.object.isRequired, // eslint-disable-line
    formValues: PropTypes.object.isRequired, // eslint-disable-line
    onSubmit: PropTypes.func.isRequired,
    pending: PropTypes.bool,
};

const defaultProps = {
    formError: [],
    formErrors: {},
    formValues: {},
    pending: false,
};

@CSSModules(styles)
export default class LoginForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            formError: this.props.formError,
            formErrors: this.props.formErrors,
            formValues: this.props.formValues,
        };

    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            formErrors: nextProps.formErrors,
            formError: nextProps.formError,
            formValues: nextProps.formValues,
        });
    }


    render() {
        const { pending } = this.props;

        return (
            'test'
        );
    }
}
