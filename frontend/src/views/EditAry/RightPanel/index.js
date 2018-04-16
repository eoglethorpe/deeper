import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import MultiViewContainer from '../../../vendor/react-store/components/View/MultiViewContainer';
import FixedTabs from '../../../vendor/react-store/components/View/FixedTabs';
import SuccessButton from '../../../vendor/react-store/components/Action/Button/SuccessButton';
import { reverseRoute } from '../../../vendor/react-store/utils/common';
import { pathNames } from '../../../constants';
import {
    leadIdFromRouteSelector,
    projectIdFromRouteSelector,
    aryStringsSelector,
    aryTemplateMetadataSelector,
    aryTemplateMethodologySelector,

    setErrorAryForEditAryAction,
    setAryForEditAryAction,

    editAryFormErrorsSelector,
    editAryFieldErrorsSelector,
    editAryFormValuesSelector,
    editAryHasErrorsSelector,
    editAryIsPristineSelector,
} from '../../../redux';

import Form, {
    requiredCondition,
} from '../../../vendor/react-store/components/Input/Form';
import Baksa from '../../../components/Baksa';
import AryPutRequest from '../requests/AryPutRequest';

import Metadata from './Metadata';
import Methodology from './Methodology';
import Summary from './Summary';
import Score from './Score';


import styles from './styles.scss';

const propTypes = {
    activeLeadId: PropTypes.number.isRequired,
    activeProjectId: PropTypes.number.isRequired,
    aryStrings: PropTypes.func.isRequired,
    aryTemplateMetadata: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    aryTemplateMethodology: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    editAryFormValues: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    editAryFieldErrors: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    editAryHasErrors: PropTypes.bool.isRequired,
    editAryIsPristine: PropTypes.bool.isRequired,
    editAryFormErrors: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    setErrorAry: PropTypes.func.isRequired,
    setAry: PropTypes.func.isRequired,
};

const defaultProps = {
    aryTemplateMetadata: [],
    aryTemplateMethodology: [],
    editAryFormErrors: {},
    editAryFieldErrors: {},
    editAryFormValues: {},
};

const mapStateToProps = state => ({
    aryStrings: aryStringsSelector(state),
    activeLeadId: leadIdFromRouteSelector(state),
    activeProjectId: projectIdFromRouteSelector(state),
    aryTemplateMetadata: aryTemplateMetadataSelector(state),
    aryTemplateMethodology: aryTemplateMethodologySelector(state),

    editAryFormErrors: editAryFormErrorsSelector(state),
    editAryFieldErrors: editAryFieldErrorsSelector(state),
    editAryFormValues: editAryFormValuesSelector(state),
    editAryHasErrors: editAryHasErrorsSelector(state),
    editAryIsPristine: editAryIsPristineSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setErrorAry: params => dispatch(setErrorAryForEditAryAction(params)),
    setAry: params => dispatch(setAryForEditAryAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class RightPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static createSchema = (aryTemplateMetadata, aryTemplateMethodology) => {
        const schema = { fields: {
            metadata: RightPanel.createMetadataSchema(aryTemplateMetadata),
            methodology: RightPanel.createMethodologySchema(aryTemplateMethodology),
        } };
        return schema;
    }

    static createMetadataSchema = (aryTemplateMetadata = {}) => {
        const {
            bothPageRequiredCondition,
            validPageRangeCondition,
            validPageNumbersCondition,
            pendingCondition,
        } = Baksa;

        const schema = { fields: {
            executiveSummary: [
                bothPageRequiredCondition,
                validPageRangeCondition,
                validPageNumbersCondition,
                pendingCondition,
            ],
            assessmentData: [pendingCondition],
            questionnaire: [
                bothPageRequiredCondition,
                validPageRangeCondition,
                validPageNumbersCondition,
                pendingCondition,
            ],
        } };

        // Dynamic fields from metadataGroup
        const dynamicFields = {};
        Object.keys(aryTemplateMetadata).forEach((key) => {
            aryTemplateMetadata[key].fields.forEach((field) => {
                dynamicFields[field.id] = [requiredCondition];
            });
        });

        schema.fields = {
            ...schema.fields,
            ...dynamicFields,
        };

        return schema;
    }

    static createMethodologySchema = (aryTemplateMethodology = {}) => {
        const schema = { fields: {
            attributes: {
                member: { fields: {
                    // NOTE: inject here
                } },
                validation: (value) => {
                    const errors = [];
                    if (!value || value.length < 1) {
                        // FIXME: Use strings
                        errors.push('There should be at least one value');
                    }
                    return errors;
                },
            },

            sectors: [],
            focuses: [],
            locations: [],
            affectedGroups: [],

            objectives: [],
            dataCollectionTechniques: [],
            sampling: [],
            limitations: [],
        } };

        const dynamicFields = {};
        Object.keys(aryTemplateMethodology).forEach((key) => {
            const methodologyGroup = aryTemplateMethodology[key];
            methodologyGroup.fields.forEach((field) => {
                dynamicFields[field.id] = [requiredCondition];
            });
        });
        schema.fields.attributes.member.fields = dynamicFields;

        return schema;
    }

    constructor(props) {
        super(props);

        this.state = {
            currentTabKey: 'score',
            schema: RightPanel.createSchema(
                props.aryTemplateMetadata,
                props.aryTemplateMethodology,
            ),
            pending: false,
        };

        this.setTabAndViews(props);
    }

    componentWillReceiveProps(nextProps) {
        if (
            this.props.aryTemplateMetadata !== nextProps.aryTemplateMetadata ||
            this.props.aryTemplateMethodology !== nextProps.aryTemplateMethodology
        ) {
            this.setState({
                schema: RightPanel.createSchema(
                    nextProps.aryTemplateMetadata,
                    nextProps.aryTemplateMethodology,
                ),
            });
        }
    }

    componentWillUnmount() {
        if (this.aryPutRequest) {
            this.aryPutRequest.stop();
        }
    }

    setTabAndViews = (props) => {
        this.tabs = {
            metadata: props.aryStrings('metadataTabLabel'),
            methodology: props.aryStrings('methodologyTabLabel'),
            summary: props.aryStrings('summaryTabLabel'),
            score: props.aryStrings('scoreTabLabel'),
        };

        this.views = {
            metadata: {
                component: () => (
                    <Metadata
                        schema={this.state.schema.fields.metadata}
                        formValues={this.props.editAryFormValues.metadata}
                        fieldErrors={this.props.editAryFieldErrors.metadata}
                        formErrors={(this.props.editAryFormErrors.fields || {}).metadata}
                        pending={this.state.pending}
                    />
                ),
            },
            methodology: {
                component: () => (
                    <Methodology
                        schema={this.state.schema.fields.methodology}
                        formValues={this.props.editAryFormValues.methodology}
                        fieldErrors={this.props.editAryFieldErrors.methodology}
                        formErrors={(this.props.editAryFormErrors.fields || {}).methodology}
                        pending={this.state.pending}
                    />
                ),
            },
            summary: {
                component: () => (
                    <Summary
                        schema={this.state.schema.fields.summary}
                        formValues={this.props.editAryFormValues.summary}
                        fieldErrors={this.props.editAryFieldErrors.summary}
                        formErrors={(this.props.editAryFormErrors.fields || {}).summary}
                        pending={this.state.pending}
                    />
                ),
            },
            score: {
                component: () => (
                    <Score
                        schema={this.state.schema.fields.score}
                        formValues={this.props.editAryFormValues.score}
                        fieldErrors={this.props.editAryFieldErrors.score}
                        formErrors={(this.props.editAryFormErrors.fields || {}).score}
                        pending={this.state.pending}
                    />
                ),
            },
        };
    }

    successCallback = (value) => {
        if (this.aryPutRequest) {
            this.aryPutRequest.stop();
        }
        const request = new AryPutRequest({
            setState: params => this.setState(params),
            setAry: this.props.setAry,
        });
        this.aryPutRequest = request.create(this.props.activeLeadId, value);
        this.aryPutRequest.start();
    };

    failureCallback = (fieldErrors, formErrors) => {
        this.props.setErrorAry({
            lead: this.props.activeLeadId,
            formErrors,
            fieldErrors,
        });
    };

    handleTabClick = (key) => {
        if (key !== this.state.currentTabKey) {
            this.setState({ currentTabKey: key });
        }
    }

    render() {
        const { currentTabKey } = this.state;
        const linkToEditEntries = reverseRoute(
            pathNames.editEntries,
            {
                projectId: this.props.activeProjectId,
                leadId: this.props.activeLeadId,
            },
        );

        // FIXME: send pending inside later to disable form

        return (
            <Fragment>
                <FixedTabs
                    className={styles.tabs}
                    active={currentTabKey}
                    tabs={this.tabs}
                    onClick={this.handleTabClick}
                >
                    <Link
                        className={styles.entriesLink}
                        to={linkToEditEntries}
                    >
                        {this.props.aryStrings('entriesTabLabel')}
                    </Link>
                    <Form
                        schema={this.state.schema}
                        value={this.props.editAryFormValues}
                        successCallback={this.successCallback}
                        failureCallback={this.failureCallback}
                    >
                        <SuccessButton
                            className={styles.saveButton}
                            type="submit"
                            disabled={
                                this.props.editAryIsPristine
                                || this.props.editAryHasErrors
                                || this.state.pending
                            }
                        >
                            {/* FIXME: use strings */}
                            Save
                        </SuccessButton>
                    </Form>
                </FixedTabs>
                <MultiViewContainer
                    active={currentTabKey}
                    views={this.views}
                />
            </Fragment>
        );
    }
}
