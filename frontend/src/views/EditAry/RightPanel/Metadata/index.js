import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    aryViewMetadataSelector,
    aryTemplateMetadataSelector,
    leadIdFromRouteSelector,
    setAryAction,
} from '../../../../redux';
import Form from '../../../../vendor/react-store/components/Input/Form';
import NonFieldErrors from '../../../../vendor/react-store/components/Input/NonFieldErrors';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import SuccessButton from '../../../../vendor/react-store/components/Action/Button/SuccessButton';
import Baksa from '../../../../components/Baksa';

import AryPutRequest from '../../requests/AryPutRequest';
import { renderWidget } from '../widgetUtils';
import styles from './styles.scss';

const propTypes = {
    activeLeadId: PropTypes.number.isRequired,
    metadata: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    aryTemplateMetadata: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    setAry: PropTypes.func.isRequired,
    schema: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    metadata: {},
    aryTemplateMetadata: {},
};

const mapStateToProps = state => ({
    activeLeadId: leadIdFromRouteSelector(state),
    metadata: aryViewMetadataSelector(state),
    aryTemplateMetadata: aryTemplateMetadataSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAry: params => dispatch(setAryAction(params)),
});


@connect(mapStateToProps, mapDispatchToProps)
export default class Metadata extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pending: false,
            formErrors: {},
            formFieldErrors: {},
        };
    }

    componentWillUnmount() {
        if (this.aryPutRequest) {
            this.aryPutRequest.stop();
        }
    }

    changeCallback = (values, formFieldErrors, formErrors) => {
        this.props.setAry({
            lead: this.props.activeLeadId,
            metadata: values,
        });

        this.setState({
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

    successCallback = (value) => {
        const { activeLeadId, setAry } = this.props;

        if (this.aryPutRequest) {
            this.aryPutRequest.stop();
        }

        const aryPutRequest = new AryPutRequest({
            setAry,
            setState: params => this.setState(params),
        });
        this.aryPutRequest = aryPutRequest.create(activeLeadId, { metadata: value });
        this.aryPutRequest.start();
    };

    renderMetadata = (data) => {
        const {
            fields,
            id,
            title,
        } = data;

        return (
            <div
                key={id}
                className={styles.widgetGroup}
            >
                <h4 className={styles.heading}>
                    {title}
                </h4>
                <div className={styles.content}>
                    {Object.values(fields).map(renderWidget)}
                </div>
            </div>
        );
    }

    render() {
        const {
            aryTemplateMetadata: metadataGroups,
            schema,
        } = this.props;

        const {
            pending,
            formErrors,
            formFieldErrors,
        } = this.state;

        // FIXME: use strings
        const saveButtonLabel = 'Save';
        const bottomHeader = 'Additional Documents';

        return (
            <Form
                className={styles.metadata}
                schema={schema}
                changeCallback={this.changeCallback}
                successCallback={this.successCallback}
                failureCallback={this.failureCallback}
                value={this.props.metadata}
                formErrors={formErrors}
                fieldErrors={formFieldErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <header className={styles.header}>
                    <NonFieldErrors
                        className={styles.nonFieldErrors}
                        formerror=""
                    />
                    <div className={styles.actionButtons}>
                        <SuccessButton type="submit">
                            { saveButtonLabel }
                        </SuccessButton>
                    </div>
                </header>
                <div className={styles.top}>
                    {Object.values(metadataGroups).map(this.renderMetadata)}
                </div>
                <div className={styles.bottom}>
                    <header className={styles.header}>
                        <h3 className={styles.heading}>
                            { bottomHeader }
                        </h3>
                    </header>
                    <div className={styles.documents}>
                        <Baksa
                            // FIXME: use strings
                            label="Executive Summary"
                            className={styles.baksa}
                            formname="executiveSummary"
                            showPageRange
                        />
                        <Baksa
                            // FIXME: use strings
                            label="Assessment Database"
                            className={styles.baksa}
                            formname="assessmentData"
                            acceptUrl
                        />
                        <Baksa
                            // FIXME: use strings
                            label="Questionnaire"
                            className={styles.baksa}
                            formname="questionnaire"
                            showPageRange
                        />
                    </div>
                </div>
            </Form>
        );
    }
}
