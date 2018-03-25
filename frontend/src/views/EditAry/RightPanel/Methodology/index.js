import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    // aryStringsSelector,
    aryViewMethodologySelector,
    aryTemplateMethodologySelector,
    leadIdFromRouteSelector,
    setAryAction,
} from '../../../../redux';

import Form, {
    requiredCondition,
} from '../../../../vendor/react-store/components/Input/Form';
import NonFieldErrors from '../../../../vendor/react-store/components/Input/NonFieldErrors';
import MultiSelectInput from '../../../../vendor/react-store/components/Input/SelectInput/MultiSelectInput';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import DateInput from '../../../../vendor/react-store/components/Input/DateInput';
import SelectInput from '../../../../vendor/react-store/components/Input/SelectInput';
import NumberInput from '../../../../vendor/react-store/components/Input/NumberInput';
import TextInput from '../../../../vendor/react-store/components/Input/TextInput';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import Button from '../../../../vendor/react-store/components/Action/Button';

// import RegionMap from '../../../../components/RegionMap';
import { iconNames } from '../../../../constants';

import AryPutRequest from '../../requests/AryPutRequest';

import styles from './styles.scss';

const propTypes = {
    activeLeadId: PropTypes.number.isRequired,
    // aryStrings: PropTypes.func.isRequired,
    methodology: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    aryTemplateMethodology: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    setAry: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    aryTemplateMethodology: {},
};

const mapStateToProps = state => ({
    // aryStrings: aryStringsSelector(state),
    activeLeadId: leadIdFromRouteSelector(state),
    methodology: aryViewMethodologySelector(state),
    aryTemplateMethodology: aryTemplateMethodologySelector(state),
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

    static getSchema = (methodologyGroups) => {
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
            },
        };

        Object.keys(methodologyGroups).forEach((key) => {
            const methodologyGroup = methodologyGroups[key];
            methodologyGroup.fields.forEach((field) => {
                schema.fields.attributes.member.fields[field.id] = [requiredCondition];
            });
        });

        return schema;
    }

    constructor(props) {
        super(props);

        const {
            aryTemplateMethodology: methodologyGroups,
            methodology,
        } = props;
        const schema = Methodology.getSchema(methodologyGroups);

        this.state = {
            formValues: methodology,
            formErrors: {},
            formFieldErrors: {},
            schema,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.aryTemplateMethodology !== nextProps.aryTemplateMethodology) {
            const { aryTemplateMethodology: methodologyGroups } = nextProps;
            const schema = Methodology.getSchema(methodologyGroups);
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

        const aryPutRequest = new AryPutRequest(this, { setAry });
        this.aryPutRequest = aryPutRequest.create(activeLeadId, { methodology_data: value });
        this.aryPutRequest.start();
    };

    render() {
        const { aryTemplateMethodology: methodologyGroups } = this.props;
        const {
            pending,
            schema,
            formValues,
            formErrors,
            formFieldErrors,
        } = this.state;

        const renderMethodologyGroupHeaders = (key) => {
            const methodologyGroup = methodologyGroups[key];
            return (
                <h3 key={methodologyGroup.id}>
                    {methodologyGroup.title}
                </h3>
            );
        };

        const renderMethodologyField = (context, field) => {
            const formname = `attributes:${context}:${field.id}`;
            const newField = {
                ...field,
                id: formname,
            };
            return Methodology.renderWidget(newField);
        };

        const renderMethodologyGroup = (context, key) => {
            const methodologyGroup = methodologyGroups[key];
            return (
                <div
                    key={key}
                    className={styles.fieldInputs}
                >
                    {
                        methodologyGroup.fields
                            .map(field => renderMethodologyField(context, field))
                    }
                </div>
            );
        };

        const renderMethodologyRow = (attribute, index) => (
            <div
                key={index}
                className={styles.values}
            >
                {
                    Object.keys(methodologyGroups)
                        .map(key => renderMethodologyGroup(index, key))
                }
                <div className={styles.removeButton}>
                    <DangerButton
                        formname={`attributes:${index}`}
                        formpop
                        iconName={iconNames.delete}
                    />
                </div>
            </div>
        );

        return (
            <div className={styles.methodology}>
                <Form
                    className={styles.overview}
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
                    <div className={styles.fields}>
                        <div className={styles.fieldTitle}>
                            { Object.keys(methodologyGroups).map(renderMethodologyGroupHeaders) }
                            <div className={styles.add}>
                                <PrimaryButton
                                    formname="attributes"
                                    formpush="start"
                                    iconName={iconNames.add}
                                />
                            </div>
                        </div>
                        <div className={styles.fieldValues}>
                            { (formValues.attributes || []).map(renderMethodologyRow) }
                        </div>
                    </div>
                    <NonFieldErrors formerror="attributes" />
                    <div className={styles.actionButtons}>
                        <Button
                            type="submit"
                        >
                            Submit
                        </Button>
                    </div>
                </Form>
                {/*
                <div className={styles.overview}>
                    <div className={styles.technique}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('collectionTechniqueLabel')}
                        </h3>
                        <SelectInput
                            showHintAndError={false}
                            className={styles.techniqueChild}
                        />
                    </div>
                    <div className={styles.sampling}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('samplingLabel')}
                        </h3>
                        <TextInput
                            showHintAndError={false}
                            label={this.props.aryStrings('approachLabel')}
                            className={styles.samplingChild}
                        />
                        <TextInput
                            showHintAndError={false}
                            label={this.props.aryStrings('sizeLabel')}
                            className={styles.samplingChild}
                        />
                    </div>
                    <div className={styles.proximity}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('proximityLabel')}
                        </h3>
                        <SelectInput
                            showHintAndError={false}
                            className={styles.proximityChild}
                        />
                    </div>
                    <div className={styles.unit}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('unitOfAnalysisLabel')}
                        </h3>
                        <SelectInput
                            showHintAndError={false}
                            className={styles.unitChild}
                        />
                    </div>
                    <div className={styles.disaggregation}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('disaggregationLabel')}
                        </h3>
                        <SelectInput
                            showHintAndError={false}
                            className={styles.disaggregationChild}
                        />
                    </div>
                    <div className={styles.questions}>
                        <div className={styles.heading}>
                            <h3>
                                {this.props.aryStrings('questionsLabel')}
                            </h3>
                            <PrimaryButton
                                iconName={iconNames.add}
                                onClick={this.handleAddQuestionButtonClick}
                                transparent
                            />
                        </div>
                        <div className={styles.questionsList}>
                            <TextInput
                                showHintAndError={false}
                                label="Question #1"
                                className={styles.questionsChild}
                            />
                            <TextInput
                                showHintAndError={false}
                                label="Question #1"
                                className={styles.questionsChild}
                            />
                            <TextInput
                                showHintAndError={false}
                                label="Question #1"
                                className={styles.questionsChild}
                            />
                            <TextInput
                                showHintAndError={false}
                                label="Question #1"
                                className={styles.questionsChild}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.middle}>
                    <div className={styles.topicsAssessed}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('topicAssessedLabel')}
                        </h3>
                    </div>
                    <div className={styles.affectedGroups}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('affectedGroupsLabel')}
                        </h3>
                    </div>
                    <div className={styles.location}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('locationLabel')}
                        </h3>
                        <div
                            className={styles.mapContainer}
                        >
                            <RegionMap regionId={155} />
                        </div>
                    </div>
                </div>
                <div className={styles.structure}>
                    <h3 className={styles.heading}>
                        {this.props.aryStrings('structureSectionLabel')}
                    </h3>
                    <div
                        className={styles.collectionTechnique}
                    >
                        {this.props.aryStrings('dragDataCollectionlabel')}
                    </div>
                    <div
                        className={styles.samplingData}
                    >
                        {this.props.aryStrings('dragSamplingLabel')}
                    </div>
                    <div
                        className={styles.limitations}
                    >
                        {this.props.aryStrings('dragLimitationsLabel')}
                    </div>
                </div>
                */}
            </div>
        );
    }
}
