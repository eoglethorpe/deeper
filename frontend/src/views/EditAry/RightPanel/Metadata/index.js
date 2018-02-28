import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    // aryStringsSelector,
    aryViewMetadataSelector,
    aryTemplateMetadataSelector,
    // setAryAction,
} from '../../../../redux';
import Form, {
    requiredCondition,
} from '../../../../vendor/react-store/components/Input/Form';


// import DateInput from '../../../../vendor/react-store/components/Input/DateInput';
import MultiSelectInput from '../../../../vendor/react-store/components/Input/SelectInput/MultiSelectInput';
import SelectInput from '../../../../vendor/react-store/components/Input/SelectInput';
import NumberInput from '../../../../vendor/react-store/components/Input/NumberInput';
import TextInput from '../../../../vendor/react-store/components/Input/TextInput';
import Button from '../../../../vendor/react-store/components/Action/Button';

import styles from './styles.scss';

const propTypes = {
    // aryStrings: PropTypes.func.isRequired,
    metaData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    aryTemplateMetadata: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    // setAry: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    metaData: {},
    aryTemplateMetadata: {},
};

const mapStateToProps = state => ({
    // aryStrings: aryStringsSelector(state),
    metaData: aryViewMetadataSelector(state),
    aryTemplateMetadata: aryTemplateMetadataSelector(state),
});

/*
const mapDispatchToProps = dispatch => ({
    // setAry: params => dispatch(setAryAction(params)),
});
*/

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Metadata extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static renderWidget = ({ id: key, fieldType, title, options, placeholder }) => {
        const id = String(key);
        switch (fieldType) {
            case 'string':
                return (
                    <TextInput
                        key={id}
                        formname={id}
                        label={title}
                        placeholder={placeholder}
                    />
                );
            case 'number':
                return (
                    <NumberInput
                        key={id}
                        formname={id}
                        label={title}
                        separator=" "
                        placeholder={placeholder}
                    />
                );
            case 'multiselect':
                return (
                    <MultiSelectInput
                        key={id}
                        formname={id}
                        label={title}
                        separator=" "
                        placeholder={placeholder}
                        options={options}
                    />
                );
            case 'select':
                return (
                    <SelectInput
                        key={id}
                        formname={id}
                        label={title}
                        separator=" "
                        placeholder={placeholder}
                        options={options}
                    />
                );
            default:
                return null;
        }
    }

    static calcElements = (metadataGroups) => {
        const elements = [];
        const validations = {};
        Object.keys(metadataGroups).forEach((key) => {
            const metadataGroup = metadataGroups[key];
            metadataGroup.fields.forEach((field) => {
                elements.push(String(field.id));
                validations[field.id] = [requiredCondition];
            });
        });
        return { elements, validations };
    }

    constructor(props) {
        super(props);

        const { aryTemplateMetadata: metadataGroups } = this.props;
        const { elements, validations } = Metadata.calcElements(metadataGroups);

        this.state = {
            formValues: this.props.metaData || {},
            formFieldErrors: {},
            elements,
            validations,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.aryTemplateMetadata !== nextProps.aryTemplateMetadata) {
            const { aryTemplateMetadata: metadataGroups } = nextProps;
            const { elements, validations } = Metadata.calcElements(metadataGroups);
            this.setState({
                elements,
                validations,
            });
        }
    }

    /*
    componentWillMount() {
        this.props.setAry({
            metaData: { data: 'hello' },
            id: 1,
        });
    }
    */

    // FORM RELATED
    changeCallback = (values, { formErrors, formFieldErrors }) => {
        console.warn(values, formErrors, formFieldErrors);
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
            pristine: true,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        console.warn(formErrors, formFieldErrors);
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    successCallback = (value) => {
        console.warn('Yess success', value);
    };


    render() {
        const { aryTemplateMetadata: metadataGroups } = this.props;

        return (
            <div className={styles['meta-data']}>
                <Form
                    className={styles.overview}
                    elements={this.state.elements}
                    value={this.state.formValues}
                    error={this.state.formFieldErrors}
                    validations={this.state.validations}
                    changeCallback={this.changeCallback}
                    successCallback={this.successCallback}
                    failureCallback={this.failureCallback}
                >
                    {
                        Object.keys(metadataGroups).map((key) => {
                            const metadataGroup = metadataGroups[key];
                            return (
                                <div
                                    key={metadataGroup.id}
                                    className={styles.background}
                                >
                                    <h3 className={styles.heading}>
                                        {metadataGroup.title}
                                    </h3>
                                    { metadataGroup.fields.map(Metadata.renderWidget) }
                                </div>
                            );
                        })
                    }
                    <Button> Submit </Button>
                </Form>
                {/*
                <div className={styles.structure}>
                    <h3 className={styles.heading}>
                        {this.props.aryStrings('structureSectionLabel')}
                    </h3>
                    <div
                        className={styles.kobo}
                    >
                        {this.props.aryStrings('dragKoboLabel')}
                    </div>
                    <div
                        className={styles.questionnaire}
                    >
                        {this.props.aryStrings('dragQuestionLabel')}
                    </div>
                    <div
                        className={styles.documents}
                    >
                        {this.props.aryStrings('dragDocumentLabel')}
                    </div>
                </div>
                */}
            </div>
        );
    }
}
