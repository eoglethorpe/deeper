import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../../../vendor/react-store/utils/rest';
import NonFieldErrors from '../../../../../vendor/react-store/components/Input/NonFieldErrors';
import TextInput from '../../../../../vendor/react-store/components/Input/TextInput';
import LoadingAnimation from '../../../../../vendor/react-store/components/View/LoadingAnimation';
import DangerButton from '../../../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import Faram, {
    requiredCondition,
} from '../../../../../vendor/react-store/components/Input/Faram';

import {
    alterResponseErrorToFaramError,
    createParamsForCeCreate,
    urlForCeCreate,
} from '../../../../../rest';
import { addNewCeAction } from '../../../../../redux';
import _ts from '../../../../../ts';
import schema from '../../../../../schema';

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
export default class AddCategoryEditor extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: {},
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
            .preLoad(() => this.setState({ pending: true }))
            .postLoad(() => this.setState({ pending: false }))
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
                const faramErrors = alterResponseErrorToFaramError(response.errors);
                this.setState({ faramErrors });
            })
            .fatal(() => {
                this.setState({
                    faramErrors: { $internal: [_ts('project', 'categoryEditorCreateFailure')] },
                });
            })
            .build();
        return ceCreateRequest;
    }

    // faram RELATED
    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    };

    handleValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleValidationSuccess = (data) => {
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
            faramErrors,
            faramValues,
            pending,
            pristine,
        } = this.state;

        const { className } = this.props;

        return (
            <Faram
                className={`${className} ${styles.addCategoryEditorForm}`}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleValidationFailure}
                onValidationSuccess={this.handleValidationSuccess}
                schema={this.schema}
                value={faramValues}
                error={faramErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors faramElement />
                <TextInput
                    label={_ts('project', 'addAfTitleLabel')}
                    faramElementName="title"
                    placeholder={_ts('project', 'addCeTitlePlaceholder')}
                    autoFocus
                />
                <div className={styles.actionButtons}>
                    <DangerButton onClick={this.props.onModalClose}>
                        {_ts('project', 'modalCancel')}
                    </DangerButton>
                    <PrimaryButton
                        disabled={pending || !pristine}
                        type="submit"
                    >
                        {_ts('project', 'modalAdd')}
                    </PrimaryButton>
                </div>
            </Faram>
        );
    }
}
