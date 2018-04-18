import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Form from '../../../../vendor/react-store/components/Input/Form';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import NonFieldErrors from '../../../../vendor/react-store/components/Input/NonFieldErrors';
import TextArea from '../../../../vendor/react-store/components/Input/TextArea';
import CheckGroup from '../../../../vendor/react-store/components/Input/CheckGroup';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../vendor/react-store/components/Action/Button/PrimaryButton';

import { iconNames } from '../../../../constants';

import {
    aryTemplateMethodologySelector,
    leadIdFromRouteSelector,
    assessmentSectorsSelector,
    focusesSelector,
    affectedGroupsSelector,

    projectDetailsSelector,
    geoOptionsForProjectSelector,
    changeAryMethodologyForEditAryAction,
} from '../../../../redux';

import OrganigramWithList from '../../../../components/OrganigramWithList/';
import GeoListInput from '../../../../components/GeoListInput/';

import { renderWidget } from '../widgetUtils';
import styles from './styles.scss';

const propTypes = {
    activeLeadId: PropTypes.number.isRequired,
    affectedGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
    aryTemplateMethodology: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    focuses: PropTypes.arrayOf(PropTypes.object).isRequired,
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    formValues: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    schema: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    sectors: PropTypes.arrayOf(PropTypes.object).isRequired,
    changeAryMethodology: PropTypes.func.isRequired,
    fieldErrors: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    formErrors: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool.isRequired,
};

const defaultProps = {
    aryTemplateMethodology: [],
    className: '',
    geoOptions: {},
    formValues: {},
    fieldErrors: {},
    formErrors: {},
};

const mapStateToProps = (state, props) => ({
    activeLeadId: leadIdFromRouteSelector(state),
    affectedGroups: affectedGroupsSelector(state),
    aryTemplateMethodology: aryTemplateMethodologySelector(state),
    focuses: focusesSelector(state),
    geoOptions: geoOptionsForProjectSelector(state, props),
    projectDetails: projectDetailsSelector(state, props),
    sectors: assessmentSectorsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    changeAryMethodology: params => dispatch(changeAryMethodologyForEditAryAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class Methodology extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    changeCallback = (values, formFieldErrors, formErrors) => {
        this.props.changeAryMethodology({
            lead: this.props.activeLeadId,
            formValues: values,
            fieldErrors: formFieldErrors,
            formErrors,
        });
    };

    renderAttributeHeader = (key) => {
        const { aryTemplateMethodology: attributesTemplate } = this.props;
        const methodologyGroup = attributesTemplate[key];

        return (
            <div
                className={styles.title}
                key={methodologyGroup.id}
            >
                {methodologyGroup.title}
            </div>
        );
    };

    renderField = (context, field) => {
        const formname = `attributes:${context}:${field.id}`;

        const newField = {
            ...field,
            id: formname,
        };
        return renderWidget(newField);
    };

    renderAttribute = (context, key) => {
        const { aryTemplateMethodology: attributesTemplate } = this.props;
        const methodologyGroup = attributesTemplate[key];

        return (
            <div
                key={key}
                className={styles.cell}
            >
                {
                    methodologyGroup.fields
                        .map(field => this.renderField(context, field))
                }
            </div>
        );
    }

    renderAttributeRow = (attribute, index) => {
        const { aryTemplateMethodology: attributesTemplate } = this.props;

        return (
            <div
                key={index}
                className={styles.row}
            >
                {
                    Object.keys(attributesTemplate)
                        .map(key => this.renderAttribute(index, key))
                }
                <div className={styles.actionButtons}>
                    <DangerButton
                        formname={`attributes:${index}`}
                        formpop
                        iconName={iconNames.delete}
                    />
                </div>
            </div>
        );
    }

    render() {
        const {
            aryTemplateMethodology: attributesTemplate,
            sectors,
            focuses,
            affectedGroups,
            projectDetails,
            geoOptions,
            schema,
            formValues,
        } = this.props;

        const { attributes = [] } = formValues;

        // FIXME: use strings
        const focusesTitle = 'Focuses';
        const sectorsTitle = 'Sectors';
        const affectedGroupsTitle = 'Affected groups';
        const locationsTitle = 'Locations';

        return (
            <Form
                className={styles.methodology}
                schema={schema}
                value={formValues}
                fieldErrors={this.props.fieldErrors}
                formErrors={this.props.formErrors}
                changeCallback={this.changeCallback}
                disabled={this.props.pending}
            >
                {this.props.pending && <LoadingAnimation large />}
                <div className={styles.header}>
                    <NonFieldErrors
                        className={styles.nonFieldErrors}
                        formerror="attributes"
                    />
                </div>
                <div className={styles.scrollWrap}>
                    <div className={styles.attributes}>
                        <div className={styles.header}>
                            {Object.keys(attributesTemplate).map(this.renderAttributeHeader)}
                            <div className={styles.actionButtons}>
                                <PrimaryButton
                                    formname="attributes"
                                    formpush="start"
                                    iconName={iconNames.add}
                                />
                            </div>
                        </div>
                        { attributes.map(this.renderAttributeRow) }
                    </div>
                </div>
                <div className={styles.center}>
                    <CheckGroup
                        title={focusesTitle}
                        formname="focuses"
                        options={focuses}
                        className={styles.focuses}
                        keySelector={d => d.id}
                        labelSelector={d => d.title}
                    />
                    <CheckGroup
                        title={sectorsTitle}
                        formname="sectors"
                        options={sectors}
                        className={styles.sectors}
                        keySelector={d => d.id}
                        labelSelector={d => d.title}
                    />
                    <OrganigramWithList
                        title={affectedGroupsTitle}
                        formname="affectedGroups"
                        className={styles.affectedGroups}
                        data={affectedGroups}
                    />
                    <GeoListInput
                        title={locationsTitle}
                        formname="locations"
                        className={styles.locationSelection}
                        geoOptionsByRegion={geoOptions}
                        regions={projectDetails.regions}
                    />
                </div>
                <div className={styles.bottom}>
                    <div className={styles.title}>
                        {/* FIXME: use strings */}
                        Methodology content
                    </div>
                    <div className={styles.body}>
                        <TextArea
                            // FIXME: use strings
                            formname="objectives"
                            className={styles.methodologyContent}
                            placeholder="Drag and drop objectives here"
                            label="Objectives"
                        />
                        <TextArea
                            // FIXME: use strings
                            formname="dataCollectionTechniques"
                            className={styles.methodologyContent}
                            placeholder="Drag and drop data collection techniques here"
                            label="Data collection techniques"
                        />
                        <TextArea
                            // FIXME: use strings
                            formname="sampling"
                            className={styles.methodologyContent}
                            placeholder="Drag and drop sampling (site and respondent selection) here"
                            label="Sampling"
                        />
                        <TextArea
                            // FIXME: use strings
                            formname="limitations"
                            className={styles.methodologyContent}
                            placeholder="Drag and drop limitations here"
                            label="Limitations"
                        />
                    </div>
                </div>
            </Form>
        );
    }
}
