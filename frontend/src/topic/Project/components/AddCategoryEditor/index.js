import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    Form,
    NonFieldErrors,
    TextInput,
    requiredCondition,
} from '../../../../public/components/Input';
import {
    LoadingAnimation,
} from '../../../../public/components/View';
import {
    DangerButton,
    PrimaryButton,
} from '../../../../public/components/Action';

import { FgRestBuilder } from '../../../../public/utils/rest';

import {
    transformResponseErrorToFormError,
    createParamsForCeCreate,
    urlForCeCreate,
} from '../../../../common/rest';
import {
    addNewCeAction,
} from '../../../../common/redux';

import schema from '../../../../common/schema';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    addNewCe: PropTypes.func.isRequired,
    onModalClose: PropTypes.func.isRequired,
    projectId: PropTypes.number,
};

const defaultProps = {
    className: '',
    projectId: undefined,
};

const mapDispatchToProps = dispatch => ({
    addNewCe: params => dispatch(addNewCeAction(params)),
});

@connect(undefined, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AddCategoryEditor extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            formErrors: [],
            formFieldErrors: {},
            formValues: {},
            pending: false,
            pristine: false,
        };

        this.elements = [
            'title',
        ];
        this.validations = {
            title: [requiredCondition],
        };
    }

    componentWillUnmount() {
        if (this.ceCreateRequest) {
            this.ceCreateRequest.stop();
        }
    }

    createRequestForCeCreate = ({ title }) => {
        const { projectId } = this.props;

        const ceCreateRequest = new FgRestBuilder()
            .url(urlForCeCreate)
            .params(() => createParamsForCeCreate({ project: projectId, title }))
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'categoryEditor');
                    this.props.addNewCe({
                        ceDetail: response,
                        projectId,
                    });
                    this.props.onModalClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                const {
                    formFieldErrors,
                    formErrors,
                } = transformResponseErrorToFormError(response.errors);
                this.setState({
                    formFieldErrors,
                    formErrors,
                    pending: true,
                });
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                this.setState({
                    formErrors: ['Error while trying to save region.'],
                    pending: true,
                });
            })
            .build();
        return ceCreateRequest;
    }

    // FORM RELATED
    changeCallback = (values, { formErrors, formFieldErrors }) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
            pristine: true,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    successCallback = (data) => {
        // Stop old post request
        if (this.ceCreateRequest) {
            this.ceCreateRequest.stop();
        }

        // Create new post request
        this.ceCreateRequest = this.createRequestForCeCreate(data);
        this.ceCreateRequest.start();
    };

    render() {
        const {
            formErrors = [],
            formFieldErrors,
            formValues,
            pending,
            pristine,
        } = this.state;

        const {
            className,
        } = this.props;

        return (
            <Form
                className={className}
                styleName="add-category-editor-form"
                changeCallback={this.changeCallback}
                elements={this.elements}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                validation={this.validation}
                validations={this.validations}
                onSubmit={this.handleSubmit}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors errors={formErrors} />
                <TextInput
                    label="Title"
                    formname="title"
                    placeholder="ACAPS framework"
                    value={formValues.title}
                    error={formFieldErrors.title}
                />
                <div styleName="action-buttons">
                    <DangerButton
                        onClick={this.props.onModalClose}
                        type="button"
                        disabled={pending}
                    >
                        Cancel
                    </DangerButton>
                    <PrimaryButton disabled={pending || !pristine} >
                        Add
                    </PrimaryButton>
                </div>
            </Form>
        );
    }
}
