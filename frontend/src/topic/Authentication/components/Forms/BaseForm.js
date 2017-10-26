/**
 * @author tnagorra <weathermist@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import Form from '../../../../public/utils/Form';
import styles from './styles.scss';

const propTypes = {
    children: PropTypes.node.isRequired, // eslint-disable-line
    elements: PropTypes.array.isRequired, // eslint-disable-line
    validations: PropTypes.object.isRequired, // eslint-disable-line
    validation: PropTypes.object.isRequired, // eslint-disable-line
    changeCallback: PropTypes.func.isRequired,
    failureCallback: PropTypes.func.isRequired,
    successCallback: PropTypes.func.isRequired,
};

const defaultProps = {
};

// NOTE: various optimizations can be done for this function
const mapChildrenRecursive = (children, condition, propertyFn) => {
    const mapFn = (child) => {
        if (!React.isValidElement(child)) {
            return child;
        }
        const { props } = child;
        const newProperties = condition(props) ? propertyFn(props) : {};
        return React.cloneElement(child, {
            ...props,
            ...newProperties,
            children: mapChildrenRecursive(props.children, condition, propertyFn),
        });
    };
    if (React.Children.count(children) <= 1) {
        return mapFn(children);
    }
    return React.Children.map(children, mapFn);
};

@CSSModules(styles)
export default class BaseForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            elements,
            validations,
            validation,
            changeCallback,
            failureCallback,
            successCallback,
        } = this.props;

        const form = new Form();
        form.setElements(elements);
        form.setValidations(validations);
        form.setValidation(validation);
        form.setCallbacks({
            changeCallback,
            failureCallback,
            successCallback,
        });

        this.form = form;
    }

    onSubmit = (e) => {
        e.preventDefault();
        this.form.onSubmit();
        return false;
    }

    // TODO: check if formName is string and length > 0
    getCondition = props => (
        props.formName && props.formName.length > 0
    )

    getPropertyFn = props => ({
        ref: this.form.updateRef(props.formName),
        onChange: this.form.onChange,
    })

    // access this from outside
    submit = () => {
        this.form.obSubmit();
    }

    render() {
        return (
            <form styleName="register-form" onSubmit={this.onSubmit}>
                { mapChildrenRecursive(
                    this.props.children,
                    this.getCondition,
                    this.getPropertyFn,
                ) }
            </form>
        );
    }
}
