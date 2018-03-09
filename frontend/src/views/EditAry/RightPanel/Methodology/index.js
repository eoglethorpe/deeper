import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    // aryStringsSelector,
    // aryViewMethodologySelector,
    aryTemplateMethodologySelector,
} from '../../../../redux';

import Form, {
    requiredCondition,
} from '../../../../vendor/react-store/components/Input/Form';
import NonFieldErrors from '../../../../vendor/react-store/components/Input/NonFieldErrors';
import MultiSelectInput from '../../../../vendor/react-store/components/Input/SelectInput/MultiSelectInput';
import DateInput from '../../../../vendor/react-store/components/Input/DateInput';
import SelectInput from '../../../../vendor/react-store/components/Input/SelectInput';
import NumberInput from '../../../../vendor/react-store/components/Input/NumberInput';
import TextInput from '../../../../vendor/react-store/components/Input/TextInput';
import Button from '../../../../vendor/react-store/components/Action/Button';


// import RegionMap from '../../../../components/RegionMap';
// import { iconNames } from '../../../../constants';

import styles from './styles.scss';

const propTypes = {
    // aryStrings: PropTypes.func.isRequired,
    // methodology: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    aryTemplateMethodology: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    // methodology: {},
    aryTemplateMethodology: {},
};

const mapStateToProps = state => ({
    // aryStrings: aryStringsSelector(state),
    // methodology: aryViewMethodologySelector(state),
    aryTemplateMethodology: aryTemplateMethodologySelector(state),
});

@connect(mapStateToProps)
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
                        if (!value || value.length <= 4) {
                            errors.push('There should be at least five value');
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
        } = this.props;
        const schema = Methodology.getSchema(methodologyGroups);

        const methodology = {
            attributes: [
                {},
            ],
        };
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
    }

    // FORM RELATED
    changeCallback = (values, formFieldErrors, formErrors) => {
        this.setState({
            formValues: values,
            formFieldErrors,
            formErrors,
            pristine: true,
        });
    };

    failureCallback = (formFieldErrors, formErrors) => {
        console.warn(formFieldErrors, formErrors);
        this.setState({
            formFieldErrors,
            formErrors,
        });
    };

    successCallback = (value) => {
        console.warn('Submit', value);
    };

    render() {
        const { aryTemplateMethodology: methodologyGroups } = this.props;
        const pending = false;

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
            return methodologyGroup.fields
                .map(field => renderMethodologyField(context, field));
        };

        const renderMethodologyRow = (attribute, index) => (
            <div key={index}>
                {
                    Object.keys(methodologyGroups)
                        .map(key => renderMethodologyGroup(index, key))
                }
                <Button
                    type="button"
                    formname={`attributes:${index}`}
                    formpop
                >
                    Remove Row
                </Button>
            </div>
        );

        return (
            <div className={styles.methodology}>
                <Form
                    className={styles.overview}
                    schema={this.state.schema}
                    value={this.state.formValues}
                    formErrors={this.state.formErrors}
                    fieldErrors={this.state.formFieldErrors}
                    changeCallback={this.changeCallback}
                    successCallback={this.successCallback}
                    failureCallback={this.failureCallback}
                    disabled={pending}
                >
                    { Object.keys(methodologyGroups).map(renderMethodologyGroupHeaders) }
                    <NonFieldErrors formerror="attributes" />
                    { (this.state.formValues.attributes || []).map(renderMethodologyRow) }
                    <Button
                        type="button"
                        formname="attributes"
                        formpush="start"
                    >
                        Add row
                    </Button>
                    <Button>
                        Submit
                    </Button>
                </Form>
                {/*
                <div className={styles.overview}>
                    <div className={styles.technique}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('collectionTechniqueLabel')}
                        </h3>
                        <SelectInput
                            showHintAndError={false}
                            className={styles['technique-child']}
                        />
                    </div>
                    <div className={styles.sampling}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('samplingLabel')}
                        </h3>
                        <TextInput
                            showHintAndError={false}
                            label={this.props.aryStrings('approachLabel')}
                            className={styles['sampling-child']}
                        />
                        <TextInput
                            showHintAndError={false}
                            label={this.props.aryStrings('sizeLabel')}
                            className={styles['sampling-child']}
                        />
                    </div>
                    <div className={styles.proximity}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('proximityLabel')}
                        </h3>
                        <SelectInput
                            showHintAndError={false}
                            className={styles['proximity-child']}
                        />
                    </div>
                    <div className={styles.unit}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('unitOfAnalysisLabel')}
                        </h3>
                        <SelectInput
                            showHintAndError={false}
                            className={styles['unit-child']}
                        />
                    </div>
                    <div className={styles.disaggregation}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('disaggregationLabel')}
                        </h3>
                        <SelectInput
                            showHintAndError={false}
                            className={styles['disaggregation-child']}
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
                        <div className={styles['questions-list']}>
                            <TextInput
                                showHintAndError={false}
                                label="Question #1"
                                className={styles['questions-child']}
                            />
                            <TextInput
                                showHintAndError={false}
                                label="Question #1"
                                className={styles['questions-child']}
                            />
                            <TextInput
                                showHintAndError={false}
                                label="Question #1"
                                className={styles['questions-child']}
                            />
                            <TextInput
                                showHintAndError={false}
                                label="Question #1"
                                className={styles['questions-child']}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.middle}>
                    <div className={styles['topics-assessed']}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('topicAssessedLabel')}
                        </h3>
                    </div>
                    <div className={styles['affected-groups']}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('affectedGroupsLabel')}
                        </h3>
                    </div>
                    <div className={styles.location}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('locationLabel')}
                        </h3>
                        <div
                            className={styles['map-container']}
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
                        className={styles['collection-technique']}
                    >
                        {this.props.aryStrings('dragDataCollectionlabel')}
                    </div>
                    <div
                        className={styles['sampling-data']}
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
