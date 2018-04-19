import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import MultiViewContainer from '../../../vendor/react-store/components/View/MultiViewContainer';
import FixedTabs from '../../../vendor/react-store/components/View/FixedTabs';
import SuccessButton from '../../../vendor/react-store/components/Action/Button/SuccessButton';
import {
    aryStringsSelector,
    leadIdFromRouteSelector,
    aryTemplateMetadataSelector,
    aryTemplateMethodologySelector,

    setErrorAryForEditAryAction,
    setAryForEditAryAction,
    changeAryForEditAryAction,

    editAryFaramValuesSelector,
    editAryFaramErrorsSelector,
    editAryHasErrorsSelector,
    editAryIsPristineSelector,
} from '../../../redux';

import Faram, {
    requiredCondition,
} from '../../../vendor/react-store/components/Input/Faram';
import Baksa from '../../../components/Baksa';
import AryPutRequest from '../requests/AryPutRequest';

import Metadata from './Metadata';
import Summary from './Summary';
import Score from './Score';
/*
import Methodology from './Methodology';
*/

import styles from './styles.scss';

const propTypes = {
    activeLeadId: PropTypes.number.isRequired,
    aryTemplateMetadata: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    aryTemplateMethodology: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    editAryFaramValues: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    editAryFaramErrors: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    editAryHasErrors: PropTypes.bool.isRequired,
    editAryIsPristine: PropTypes.bool.isRequired,
    setErrorAry: PropTypes.func.isRequired,
    setAry: PropTypes.func.isRequired,
    changeAry: PropTypes.func.isRequired,
    aryStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    aryTemplateMetadata: [],
    aryTemplateMethodology: [],
    editAryFaramErrors: {},
    editAryFaramValues: {},
};

const mapStateToProps = state => ({
    activeLeadId: leadIdFromRouteSelector(state),
    aryTemplateMetadata: aryTemplateMetadataSelector(state),
    aryTemplateMethodology: aryTemplateMethodologySelector(state),
    aryStrings: aryStringsSelector(state),

    editAryFaramValues: editAryFaramValuesSelector(state),
    editAryFaramErrors: editAryFaramErrorsSelector(state),
    editAryHasErrors: editAryHasErrorsSelector(state),
    editAryIsPristine: editAryIsPristineSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setErrorAry: params => dispatch(setErrorAryForEditAryAction(params)),
    setAry: params => dispatch(setAryForEditAryAction(params)),
    changeAry: params => dispatch(changeAryForEditAryAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class RightPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static createSchema = (aryTemplateMetadata /* , aryTemplateMethodology */) => {
        const schema = { fields: {
            metadata: RightPanel.createMetadataSchema(aryTemplateMetadata),
            additionalDocuments: RightPanel.createAdditionalDocumentsSchema(),
            // methodology: RightPanel.createMethodologySchema(aryTemplateMethodology),
            summary: [],
        } };
        console.warn(schema);
        return schema;
    }

    static createAdditionalDocumentsSchema = () => {
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
        return schema;
    }

    static createMetadataSchema = (aryTemplateMetadata = {}) => {
        // Dynamic fields from metadataGroup
        const dynamicFields = {};
        Object.keys(aryTemplateMetadata).forEach((key) => {
            aryTemplateMetadata[key].fields.forEach((field) => {
                dynamicFields[field.id] = [requiredCondition];
            });
        });

        const schema = { fields: dynamicFields };
        return schema;
    }

    /*
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
    */

    constructor(props) {
        super(props);

        this.state = {
            currentTabKey: 'metadata',
            pending: false,
            schema: RightPanel.createSchema(
                props.aryTemplateMetadata,
                props.aryTemplateMethodology,
            ),
        };

        this.tabs = {
            metadata: props.aryStrings('metadataTabLabel'),
            // methodology: props.aryStrings('methodologyTabLabel'),
            summary: props.aryStrings('summaryTabLabel'),
            score: props.aryStrings('scoreTabLabel'),
        };

        this.views = {
            metadata: {
                component: () => (
                    <Metadata pending={this.state.pending} />
                ),
            },
            summary: {
                component: () => (
                    <Summary pending={this.state.pending} />
                ),
            },
            /*
            methodology: {
                component: () => (
                    <Methodology pending={this.state.pending} />
                ),
            },
            */
            score: {
                component: () => (
                    <Score pending={this.state.pending} />
                ),
            },
        };
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

    handleFaramChange = (faramValues, faramErrors) => {
        this.props.changeAry({
            lead: this.props.activeLeadId,
            faramValues,
            faramErrors,
        });
    }

    handleFaramValidationSuccess = (value) => {
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

    handleFaramValidationFailure = (faramErrors) => {
        this.props.setErrorAry({
            lead: this.props.activeLeadId,
            faramErrors,
        });
    };

    handleTabClick = (key) => {
        if (key !== this.state.currentTabKey) {
            this.setState({ currentTabKey: key });
        }
    }

    render() {
        const { currentTabKey } = this.state;

        return (
            <Faram
                schema={this.state.schema}
                value={this.props.editAryFaramValues}
                error={this.props.editAryFaramErrors}

                onChange={this.handleFaramChange}
                onValidationSuccess={this.handleFaramValidationSuccess}
                onValidationFailure={this.handleFaramValidationFailure}
                disabled={this.state.pending}
            >
                <FixedTabs
                    className={styles.tabs}
                    active={currentTabKey}
                    tabs={this.tabs}
                    onClick={this.handleTabClick}
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
                </FixedTabs>
                <MultiViewContainer
                    active={currentTabKey}
                    views={this.views}
                />
            </Faram>
        );
    }
}
