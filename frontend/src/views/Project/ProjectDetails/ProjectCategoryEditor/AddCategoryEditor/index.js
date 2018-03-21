import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../../../vendor/react-store/utils/rest';
import NonFieldErrors from '../../../../../vendor/react-store/components/Input/NonFieldErrors';
import TextInput from '../../../../../vendor/react-store/components/Input/TextInput';
import LoadingAnimation from '../../../../../vendor/react-store/components/View/LoadingAnimation';
import DangerButton from '../../../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import Form, {
    requiredCondition,
} from '../../../../../vendor/react-store/components/Input/Form';

import {
    transformResponseErrorToFormError,
    createParamsForCeCreate,
    urlForCeCreate,
} from '../../../../../rest';
import {
    addNewCeAction,
    projectStringsSelector,
} from '../../../../../redux';
import schema from '../../../../../schema';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    addNewCe: PropTypes.func.isRequired,
    onModalClose: PropTypes.func.isRequired,
    projectId: PropTypes.number,
    projectStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    projectId: undefined,
};

const mapStateToProps = state => ({
    projectStrings: projectStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addNewCe: params => dispatch(addNewCeAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AddCategoryEditor extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            formErrors: {},
            formFieldErrors: {},
            formValues: {},
            pending: false,
            pristine: false,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
            },
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
                    formErrors: { errors: ['Error while trying to create new category editor.'] },
                    pending: true,
                });
            })
            .build();
        return ceCreateRequest;
    }

    // FORM RELATED
    changeCallback = (values, formFieldErrors, formErrors) => {
        this.setState({
            formValues: values,
            formFieldErrors,
            formErrors,
            pristine: true,
        });
    };

    failureCallback = (formFieldErrors, formErrors) => {
        this.setState({
            formFieldErrors,
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
            formErrors,
            formFieldErrors,
            formValues,
            pending,
            pristine,
        } = this.state;

        const { className } = this.props;

        return (
            <Form
                className={`${className} ${styles.addCategoryEditorForm}`}
                changeCallback={this.changeCallback}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                schema={this.schema}
                value={formValues}
                formErrors={formErrors}
                fieldErrors={formFieldErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors formerror="" />
                <TextInput
                    label={this.props.projectStrings('addAfTitleLabel')}
                    formname="title"
                    placeholder={this.props.projectStrings('addCeTitlePlaceholder')}
                    autoFocus
                />
                <div className={styles.actionButtons}>
                    <DangerButton
                        onClick={this.props.onModalClose}
                        type="button"
                    >
                        {this.props.projectStrings('modalCancel')}
                    </DangerButton>
                    <PrimaryButton disabled={pending || !pristine} >
                        {this.props.projectStrings('modalAdd')}
                    </PrimaryButton>
                </div>
            </Form>
        );
    }
}
