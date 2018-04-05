import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Form from '../../../../vendor/react-store/components/Input/Form';
import NonFieldErrors from '../../../../vendor/react-store/components/Input/NonFieldErrors';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import TextArea from '../../../../vendor/react-store/components/Input/TextArea';
import CheckGroup from '../../../../vendor/react-store/components/Input/CheckGroup';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import SuccessButton from '../../../../vendor/react-store/components/Action/Button/SuccessButton';

// import RegionMap from '../../../../components/RegionMap';
import { iconNames } from '../../../../constants';

import {
    aryViewMethodologySelector,
    aryTemplateMethodologySelector,
    leadIdFromRouteSelector,
    setAryAction,
    sectorsSelector,
    focusesSelector,
    affectedGroupsSelector,

    projectDetailsSelector,
    geoOptionsForProjectSelector,
} from '../../../../redux';

import OrganigramWithList from '../../../../components/OrganigramWithList/';
import GeoListInput from '../../../../components/GeoListInput/';

import AryPutRequest from '../../requests/AryPutRequest';
import { renderWidget } from '../widgetUtils';
import styles from './styles.scss';

const propTypes = {
    // aryStrings: PropTypes.func.isRequired,
    activeLeadId: PropTypes.number.isRequired,
    affectedGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
    aryTemplateMethodology: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    focuses: PropTypes.arrayOf(PropTypes.object).isRequired,
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    methodology: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    schema: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    sectors: PropTypes.arrayOf(PropTypes.object).isRequired,

    setAry: PropTypes.func.isRequired,
};

const defaultProps = {
    aryTemplateMethodology: {},
    className: '',
    geoOptions: {},
};

const mapStateToProps = (state, props) => ({
    activeLeadId: leadIdFromRouteSelector(state),
    affectedGroups: affectedGroupsSelector(state),
    aryTemplateMethodology: aryTemplateMethodologySelector(state),
    focuses: focusesSelector(state),
    geoOptions: geoOptionsForProjectSelector(state, props),
    methodology: aryViewMethodologySelector(state),
    projectDetails: projectDetailsSelector(state, props),
    sectors: sectorsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAry: params => dispatch(setAryAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class Methodology extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            formErrors: {},
            formFieldErrors: {},
        };
    }

    // FORM RELATED

    changeCallback = (values, formFieldErrors, formErrors) => {
        this.props.setAry({
            lead: this.props.activeLeadId,
            methodology: values,
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
        this.aryPutRequest = aryPutRequest.create(activeLeadId, { methodology_data: value });
        this.aryPutRequest.start();
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
            methodology,
        } = this.props;

        const {
            pending,
            formErrors,
            formFieldErrors,
        } = this.state;

        const { attributes = [] } = methodology;
        const attributesTemplateKeys = Object.keys(attributesTemplate);

        // FIXME: use strings
        const saveButtonLabel = 'Save';
        const focusesTitle = 'Focuses';
        const sectorsTitle = 'Sectors';
        const affectedGroupsTitle = 'Affected groups';
        const locationsTitle = 'Locations';

        return (
            <Form
                className={styles.methodology}
                schema={schema}
                value={methodology}
                formErrors={formErrors}
                fieldErrors={formFieldErrors}
                changeCallback={this.changeCallback}
                successCallback={this.successCallback}
                failureCallback={this.failureCallback}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <div className={styles.header}>
                    <NonFieldErrors
                        className={styles.nonFieldErrors}
                        formerror="attributes"
                    />
                    <div className={styles.actionButtons}>
                        <SuccessButton type="submit">
                            { saveButtonLabel }
                        </SuccessButton>
                    </div>
                </div>
                <div className={styles.scrollWrap}>
                    <div className={styles.attributes}>
                        <div className={styles.header}>
                            { attributesTemplateKeys.map(this.renderAttributeHeader) }
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
