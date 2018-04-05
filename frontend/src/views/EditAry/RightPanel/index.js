import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import MultiViewContainer from '../../../vendor/react-store/components/View/MultiViewContainer';
import FixedTabs from '../../../vendor/react-store/components/View/FixedTabs';
import { reverseRoute } from '../../../vendor/react-store/utils/common';
import { pathNames } from '../../../constants';
import {
    leadIdFromRouteSelector,
    projectIdFromRouteSelector,
    aryStringsSelector,
    aryTemplateMetadataSelector,
    aryTemplateMethodologySelector,
} from '../../../redux';

import { requiredCondition } from '../../../vendor/react-store/components/Input/Form';
import Baksa from '../../../components/Baksa';

import Metadata from './Metadata';
import Methodology from './Methodology';
import styles from './styles.scss';

const propTypes = {
    activeLeadId: PropTypes.number.isRequired,
    activeProjectId: PropTypes.number.isRequired,
    aryStrings: PropTypes.func.isRequired,
    aryTemplateMetadata: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    aryTemplateMethodology: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    aryTemplateMetadata: {},
    aryTemplateMethodology: {},
};

const mapStateToProps = state => ({
    aryStrings: aryStringsSelector(state),
    activeLeadId: leadIdFromRouteSelector(state),
    activeProjectId: projectIdFromRouteSelector(state),
    aryTemplateMetadata: aryTemplateMetadataSelector(state),
    aryTemplateMethodology: aryTemplateMethodologySelector(state),
});

@connect(mapStateToProps)
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
            questionnaire: [
                bothPageRequiredCondition,
                validPageRangeCondition,
                validPageNumbersCondition,
                pendingCondition,
            ],
            assessmentData: [pendingCondition],
            executiveSummary: [
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
            currentTabKey: 'metadata',
            schema: RightPanel.createSchema(
                props.aryTemplateMetadata,
                props.aryTemplateMethodology,
            ),
        };

        this.tabs = {
            metadata: this.props.aryStrings('metadataTabLabel'),
            methodology: this.props.aryStrings('methodologyTabLabel'),
            summary: this.props.aryStrings('summaryTabLabel'),
            score: this.props.aryStrings('scoreTabLabel'),
        };

        this.views = {
            metadata: {
                component: () => (
                    <Metadata schema={this.state.schema.fields.metadata} />
                ),
            },
            methodology: {
                component: () => (
                    <Methodology schema={this.state.schema.fields.methodology} />
                ),
            },
            summary: {
                component: () => (
                    <div>
                        {this.props.aryStrings('summaryTabLabel')}
                    </div>
                ),
            },
            score: {
                component: () => (
                    <div>
                        {this.props.aryStrings('scoreTabLabel')}
                    </div>
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

        console.warn(this.state.schema);

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
                </FixedTabs>
                <MultiViewContainer
                    active={currentTabKey}
                    views={this.views}
                />
            </Fragment>
        );
    }
}
