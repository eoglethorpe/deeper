import CSSModules from 'react-css-modules';
import React from 'react';

import ProjectGeneralForm from '../ProjectGeneralForm';
import styles from './styles.scss';

@CSSModules(styles, { allowMultiple: true })
export default class ProjectGeneral extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            formErrors: [],
            formFieldErrors: {},
            stale: false,
            pending: false,
            formValues: {},
        };
    }

    // FORM RELATED

    changeCallback = (values, { formErrors, formFieldErrors }) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    handleFormCancel = () => {
        console.log();
    };

    successCallback = (values) => {
        console.log(values);
        // Rest Request goes here
    };

    render() {
        const {
            formErrors,
            formFieldErrors,
            stale,
            pending,
            formValues,
        } = this.state;

        return (
            <div styleName="project-general">
                <ProjectGeneralForm
                    formValues={formValues}
                    formErrors={formErrors}
                    formFieldErrors={formFieldErrors}
                    changeCallback={this.changeCallback}
                    failureCallback={this.failureCallback}
                    handleFormCancel={this.handleFormCancel}
                    successCallback={this.successCallback}
                    stale={stale}
                    pending={pending}
                />
            </div>
        );
    }
}
