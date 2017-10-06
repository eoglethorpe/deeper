import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

import { pageTitles } from '../../../../common/utils/labels';
import { PrimaryButton, DangerButton } from '../../../../public/components/Button';
import styles from './styles.scss';
import TextInput from '../../../../public/components/TextInput';
import {
    setNavbarStateAction,
} from '../../../../common/action-creators/navbar';
import Form, {
    requiredCondition,
} from '../../../../public/utils/Form';

const mapStateToProps = state => ({
    state,
});

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),

});

const propTypes = {
    setNavbarState: PropTypes.func.isRequired,
};

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AddLead extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);
        const selected = this.props;
        this.state = {
            selectedValue: 'website',
        };
        const form = new Form();
        const elements = [
            'title',
            'source',
            'confidentiality',
            'user',
            'date',
            'type',
            'url',
            'website',
        ];
        const validations = {
            title: [requiredCondition],
            source: [requiredCondition],
            confidentiality: [requiredCondition],
            user: [requiredCondition],
            date: [requiredCondition],
            type: [requiredCondition],
            url: [requiredCondition],
            website: [requiredCondition],
        };

        const updateValues = (data) => {
            this.setState({
                formValues: { ...this.state.formValues, ...data },
            });
        };

        const updateErrors = (data) => {
            this.setState({
                formErrors: data,
            });
        };

        const okay = (data) => {
            this.props.onSubmit(data);
        };

        form.setElements(elements);
        form.setValidations(validations);

        // calls with new errors
        form.setCallbackForFocus(updateErrors);
        // new state
        form.setCallbackForChange(updateValues);
        // calls with success and error
        form.setCallbackForSuccessAndFailure(okay, updateErrors);

        this.form = form;

        this.state = {
            formErrors: { },
            formValues: { },
        };
    }
    componentWillMount() {
        this.props.setNavbarState({
            visible: true,
            activeLink: undefined,
            validLinks: [
                pageTitles.leads,
                pageTitles.entries,
                pageTitles.ary,
                pageTitles.export,

                pageTitles.userProfile,
                pageTitles.adminPanel,
                pageTitles.countryPanel,
            ],
        });
    }

    onFocus = (overrideName) => {
        this.form.onFocus(overrideName);
    }

    onChange = (value) => {
        this.form.onChange(value);
    }

    onSubmit = () => {
        this.form.onSubmit();
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.onSubmit();
        return false;
    }


    handleOptionChange = (changeEvent) => {
        this.setState({ selectedValue: changeEvent.target.value });
    };

    render() {
        const { selectedValue, pending } = this.state;
        return (
            <div styleName="add-lead">
                <Helmet>
                    <title>
                        { pageTitles.addLeads }
                    </title>
                </Helmet>
                <div styleName="container">
                    <header styleName="header">
                        <h1>{ pageTitles.addLeads }</h1>
                    </header>
                    <form
                        styleName="user-profile-edit-form"
                        onSubmit={this.handleSubmit}
                    >
                        {
                            pending &&
                            <div styleName="pending-overlay">
                                <i
                                    className="ion-load-c"
                                    styleName="loading-icon"
                                />
                            </div>
                        }
                        <TextInput
                            label="Title"
                            placeholder="Enter a descriptive name"

                            ref={this.form.updateRef('title')}
                            initialValue={this.state.formValues.title}
                            error={this.state.formErrors.title}

                            onFocus={this.onFocus}
                            onChange={this.onChange}
                        />
                        <TextInput
                            label="Source"
                            placeholder="Enter Source"

                            ref={this.form.updateRef('source')}
                            initialValue={this.state.formValues.source}
                            error={this.state.formErrors.source}

                            onFocus={this.onFocus}
                            onChange={this.onChange}

                        />
                        <TextInput
                            label="Confidentiality"
                            placeholder="Lead title"

                            ref={this.form.updateRef('confidentiality')}
                            initialValue={this.state.formValues.confidentiality}
                            error={this.state.formErrors.confidentiality}

                            onFocus={this.onFocus}
                            onChange={this.onChange}
                        />
                        <TextInput
                            label="Assign To"
                            placeholder="Select User"

                            ref={this.form.updateRef('user')}
                            initialValue={this.state.formValues.user}
                            error={this.state.formErrors.user}

                            onFocus={this.onFocus}
                            onChange={this.onChange}

                        />
                        <TextInput
                            label="Publication Date"
                            placeholder="Date Picker Goes here.."

                            ref={this.form.updateRef('date')}
                            initialValue={this.state.formValues.date}
                            error={this.state.formErrors.date}

                            onFocus={this.onFocus}
                            onChange={this.onChange}
                        />
                        <div styleName="radio-btn-container">
                            Type:
                            <input
                                type="radio"
                                value="website"
                                checked={selectedValue === 'website'}
                                onChange={this.handleOptionChange}
                            />
                            Website
                            <input
                                type="radio"
                                value="manual-entry"
                                checked={selectedValue === 'manual-entry'}
                                onChange={this.handleOptionChange}
                            />
                            Manual Entry
                            <input
                                type="radio"
                                value="attachment"
                                checked={selectedValue === 'attachment'}
                                onChange={this.handleOptionChange}
                            />
                            Attachment
                        </div>
                        <TextInput
                            label="URL"
                            placeholder="Enter URL"

                            ref={this.form.updateRef('url')}
                            initialValue={this.state.formValues.url}
                            error={this.state.formErrors.url}

                            onFocus={this.onFocus}
                            onChange={this.onChange}
                        />
                        <TextInput
                            label="Website"
                            placeholder="Enter Website"

                            ref={this.form.updateRef('website')}
                            initialValue={this.state.formValues.website}
                            error={this.state.formErrors.website}

                            onFocus={this.onFocus}
                            onChange={this.onChange}
                        />
                        <div styleName="action-buttons">
                            <PrimaryButton>
                                Save
                            </PrimaryButton>
                            <DangerButton>
                                Cancel
                            </DangerButton>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}
