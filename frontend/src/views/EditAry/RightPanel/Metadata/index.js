import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    aryStringsSelector,
    aryViewMetadataSelector,
    aryTemplateMetadataSelector,
    leadIdFromRouteSelector,
    setAryAction,
} from '../../../../redux';
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
import SuccessButton from '../../../../vendor/react-store/components/Action/Button/SuccessButton';
import Baksa from '../../../../components/Baksa';

import AryPutRequest from '../../requests/AryPutRequest';

import styles from './styles.scss';

const propTypes = {
    activeLeadId: PropTypes.number.isRequired,
    aryStrings: PropTypes.func.isRequired,
    metaData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    aryTemplateMetadata: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    setAry: PropTypes.func.isRequired,
};

const defaultProps = {
    metaData: {},
    aryTemplateMetadata: {},
};

const mapStateToProps = state => ({
    activeLeadId: leadIdFromRouteSelector(state),
    aryStrings: aryStringsSelector(state),
    metaData: aryViewMetadataSelector(state),
    aryTemplateMetadata: aryTemplateMetadataSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAry: params => dispatch(setAryAction(params)),
});

const widgets = {
    string: TextInput,
    number: NumberInput,
    date: DateInput,
    multiselect: MultiSelectInput,
    select: SelectInput,
};

@connect(mapStateToProps, mapDispatchToProps)
export default class Metadata extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;


    static getSchema = (metadataGroups) => {
        const schema = {
            fields: {},
        };

        Object.keys(metadataGroups).forEach((key) => {
            const metadataGroup = metadataGroups[key];

            metadataGroup.fields.forEach((field) => {
                schema.fields[field.id] = [requiredCondition];
            });
        });

        schema.fields.questionnaire = [
            Baksa.bothPageRequiredCondition,
            Baksa.validPageRangeCondition,
        ];
        schema.fields.assessmentData = [];
        schema.fields.executiveSummary = [
            Baksa.bothPageRequiredCondition,
            Baksa.validPageRangeCondition,
        ];

        return schema;
    }

    static renderWidget = (data) => {
        const {
            id: key,
            fieldType,
            title,
            options,
            placeholder,
        } = data;

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

        const Component = widgets[fieldType];

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

    constructor(props) {
        super(props);

        const { aryTemplateMetadata: metadataGroups } = this.props;
        const schema = Metadata.getSchema(metadataGroups);

        this.state = {
            pending: false,
            formValues: this.props.metaData || {},
            formErrors: {},
            formFieldErrors: {},
            schema,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.aryTemplateMetadata !== nextProps.aryTemplateMetadata) {
            const { aryTemplateMetadata: metadataGroups } = nextProps;
            const schema = Metadata.getSchema(metadataGroups);
            this.setState({
                schema,
                formErrors: {},
                formFieldErrors: {},
            });
        }
        if (this.props.metaData !== nextProps.metaData) {
            this.setState({
                formValues: nextProps.metaData || {},
            });
        }
    }

    componentWillUnmount() {
        if (this.aryPutRequest) {
            this.aryPutRequest.stop();
        }
    }

    changeCallback = (values, formFieldErrors, formErrors) => {
        this.props.setAry({
            lead: this.props.activeLeadId,
            metaData: values,
        });
        this.setState({
            formValues: values,
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
        this.aryPutRequest = aryPutRequest.create(activeLeadId, { metaData: value });
        this.aryPutRequest.start();
    };

    renderMetadata = (data) => {
        const {
            fields,
            id,
            title,
        } = data;
        const fieldWidgetList = Object.values(fields);

        return (
            <div
                key={id}
                className={styles.widgetGroup}
            >
                <h4 className={styles.heading}>
                    {title}
                </h4>
                <div className={styles.content}>
                    {fieldWidgetList.map(Metadata.renderWidget)}
                </div>
            </div>
        );
    }

    render() {
        const { aryTemplateMetadata: metadataGroups } = this.props;

        const {
            pending,
            schema,
            formValues,
            formErrors,
            formFieldErrors,
        } = this.state;

        const metadataList = Object.values(metadataGroups);

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
                value={formValues}
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
                        <SuccessButton
                            type="submit"
                        >
                            { saveButtonLabel }
                        </SuccessButton>
                    </div>
                </header>
                <div className={styles.top}>
                    {metadataList.map(this.renderMetadata)}
                </div>
                <div className={styles.bottom}>
                    <header className={styles.header}>
                        <h3 className={styles.heading}>
                            { bottomHeader }
                        </h3>
                    </header>
                    <div className={styles.documents}>
                        <Baksa
                            label="Executive Summary"
                            className={styles.baksa}
                            formname="executiveSummary"
                            showPageRange
                        />
                        <Baksa
                            label="Assessment Database"
                            className={styles.baksa}
                            formname="assessmentData"
                            acceptUrl
                        />
                        <Baksa
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
