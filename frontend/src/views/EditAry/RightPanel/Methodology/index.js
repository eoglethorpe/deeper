import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Form, {
    requiredCondition,
} from '../../../../vendor/react-store/components/Input/Form';
import NonFieldErrors from '../../../../vendor/react-store/components/Input/NonFieldErrors';
import MultiSelectInput from '../../../../vendor/react-store/components/Input/MultiSelectInput';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import DateInput from '../../../../vendor/react-store/components/Input/DateInput';
import SelectInput from '../../../../vendor/react-store/components/Input/SelectInput';
import NumberInput from '../../../../vendor/react-store/components/Input/NumberInput';
import TextInput from '../../../../vendor/react-store/components/Input/TextInput';
import TextArea from '../../../../vendor/react-store/components/Input/TextArea';
import CheckGroup from '../../../../vendor/react-store/components/Input/CheckGroup';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import SuccessButton from '../../../../vendor/react-store/components/Action/Button/SuccessButton';

// import RegionMap from '../../../../components/RegionMap';
import { iconNames } from '../../../../constants';

import {
    // aryStringsSelector,
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

import styles from './styles.scss';

const propTypes = {
    activeLeadId: PropTypes.number.isRequired,
    // aryStrings: PropTypes.func.isRequired,
    methodology: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    aryTemplateMethodology: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    focuses: PropTypes.arrayOf(PropTypes.object).isRequired,
    sectors: PropTypes.arrayOf(PropTypes.object).isRequired,
    affectedGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
    setAry: PropTypes.func.isRequired,

    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    aryTemplateMethodology: {},
    geoOptions: {},
};

const mapStateToProps = (state, props) => ({
    // aryStrings: aryStringsSelector(state),
    activeLeadId: leadIdFromRouteSelector(state),
    methodology: aryViewMethodologySelector(state),
    aryTemplateMethodology: aryTemplateMethodologySelector(state),
    sectors: sectorsSelector(state),
    focuses: focusesSelector(state),
    affectedGroups: affectedGroupsSelector(state),

    projectDetails: projectDetailsSelector(state, props),
    geoOptions: geoOptionsForProjectSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setAry: params => dispatch(setAryAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class Methodology extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static renderWidget = ({ id: key, fieldType, title, options, placeholder }) => {
        const id = String(key);
        const commonProps = {
            key: id,
            formname: id,
            label: title,
            placeholder,
            options,
        };
        const typeSpecificProps = {
            number: {
                separator: ' ',
            },
        };
        const components = {
            string: TextInput,
            number: NumberInput,
            date: DateInput,
            multiselect: MultiSelectInput,
            select: SelectInput,
        };

        const Component = components[fieldType];
        if (!Component) {
            console.error('Unidentified fieldType', fieldType);
            return null;
        }
        return (
            <Component
                {...commonProps}
                {...typeSpecificProps[fieldType]}
            />
        );
    }

    static getSchema = (attributesTemplate) => {
        const schema = {
            fields: {
                attributes: {
                    member: {
                        fields: {},
                        // dynamically injected fields here
                    },
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
            },
        };

        Object.keys(attributesTemplate).forEach((key) => {
            const methodologyGroup = attributesTemplate[key];
            methodologyGroup.fields.forEach((field) => {
                schema.fields.attributes.member.fields[field.id] = [requiredCondition];
            });
        });

        return schema;
    }

    constructor(props) {
        super(props);

        const {
            aryTemplateMethodology: attributesTemplate,
            methodology,
        } = props;
        const schema = Methodology.getSchema(attributesTemplate);

        this.state = {
            formValues: methodology,
            formErrors: {},
            formFieldErrors: {},
            schema,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.aryTemplateMethodology !== nextProps.aryTemplateMethodology) {
            const { aryTemplateMethodology: attributesTemplate } = nextProps;
            const schema = Methodology.getSchema(attributesTemplate);
            this.setState({
                schema,
                formFieldErrors: {},
                formErrors: {},
            });
        }
        if (this.props.methodology !== nextProps.methodology) {
            const { methodology } = nextProps;
            this.setState({ formValues: methodology });
        }
    }

    // FORM RELATED
    changeCallback = (values, formFieldErrors, formErrors) => {
        this.props.setAry({
            lead: this.props.activeLeadId,
            methodologyData: values,
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
        return Methodology.renderWidget(newField);
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
        } = this.props;

        const {
            pending,
            schema,
            formValues,
            formErrors,
            formFieldErrors,
        } = this.state;

        const { attributes = [] } = formValues;
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
                value={formValues}
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
                        Methodology content
                    </div>
                    <div className={styles.body}>
                        <TextArea
                            formname="objectives"
                            className={styles.methodologyContent}
                            placeholder="Drag and drop objectives here"
                            label="Objectives"
                        />
                        <TextArea
                            formname="dataCollectionTechniques"
                            className={styles.methodologyContent}
                            placeholder="Drag and drop data collection techniques here"
                            label="Data collection techniques"
                        />
                        <TextArea
                            formname="sampling"
                            className={styles.methodologyContent}
                            placeholder="Drag and drop sampling (site and respondent selection) here"
                            label="Sampling"
                        />
                        <TextArea
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
