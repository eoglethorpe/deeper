import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    aryTemplateMetadataSelector,
    leadIdFromRouteSelector,
    changeAryMetadataForEditAryAction,
} from '../../../../redux';
import Form from '../../../../vendor/react-store/components/Input/Form';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import NonFieldErrors from '../../../../vendor/react-store/components/Input/NonFieldErrors';
import Baksa from '../../../../components/Baksa';

import { renderWidget } from '../widgetUtils';
import styles from './styles.scss';

const propTypes = {
    activeLeadId: PropTypes.number.isRequired,
    formValues: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    fieldErrors: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    formErrors: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    aryTemplateMetadata: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    changeAryMetadata: PropTypes.func.isRequired,
    schema: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool.isRequired,
};

const defaultProps = {
    formValues: {},
    fieldErrors: {},
    formErrors: {},
    aryTemplateMetadata: [],
};

const mapStateToProps = state => ({
    activeLeadId: leadIdFromRouteSelector(state),
    aryTemplateMetadata: aryTemplateMetadataSelector(state),
});

const mapDispatchToProps = dispatch => ({
    changeAryMetadata: params => dispatch(changeAryMetadataForEditAryAction(params)),
});


@connect(mapStateToProps, mapDispatchToProps)
export default class Metadata extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    changeCallback = (values, formFieldErrors, formErrors) => {
        this.props.changeAryMetadata({
            lead: this.props.activeLeadId,
            formValues: values,
            fieldErrors: formFieldErrors,
            formErrors,
        });
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

        // FIXME: use strings
        const bottomHeader = 'Additional Documents';

        return (
            <Form
                className={styles.metadata}
                schema={schema}
                changeCallback={this.changeCallback}
                value={this.props.formValues}
                fieldErrors={this.props.fieldErrors}
                formErrors={this.props.formErrors}
                disabled={this.props.pending}
            >
                {this.props.pending && <LoadingAnimation />}
                <header className={styles.header}>
                    <NonFieldErrors
                        className={styles.nonFieldErrors}
                        formerror=""
                    />
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
