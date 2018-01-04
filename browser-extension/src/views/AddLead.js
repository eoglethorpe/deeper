import CSSModules from 'react-css-modules';
import React, { Component } from 'react';
import {
    DateInput,
    SelectInput,
    TextInput,
} from '../public-components/Input';

import {
    TransparentButton,
    PrimaryButton,
} from '../public-components/Action';

import styles from '../stylesheets/add-lead.scss';

@CSSModules(styles, { allowMultiple: true })
class AddLead extends Component {
    render() {
        const {
            inputValues,
            onChange,
            projects,
        } = this.props;

        return (
            <div styleName="add-lead">
                <header styleName="header">
                    <h1>
                        Add lead
                    </h1>
                    <TransparentButton
                        type="button"
                    >
                        Settings
                    </TransparentButton>
                </header>
                <div styleName="inputs">
                    <SelectInput
                        multiple
                        label="Project"
                        value={inputValues.project}
                        onChange={value => onChange('project', value)}
                        options={projects}
                        keySelector={d => d.id}
                        labelSelector={d => d.title}
                    />
                    <TextInput
                        label="Title"
                        value={inputValues.title}
                        onChange={value => onChange('title', value)}
                    />
                    <TextInput
                        label="Source"
                        value={inputValues.source}
                        onChange={value => onChange('source', value)}
                    />
                    <SelectInput
                        label="Confidentiality"
                        value={inputValues.confidentiality}
                        onChange={value => onChange('confidentiality', value)}
                    />
                    <SelectInput
                        multiple
                        label="Assigned to"
                        value={inputValues.assignedTo}
                        onChange={value => onChange('assignedTo', value)}
                    />
                    <DateInput
                        label="Published on"
                        value={inputValues.publishedOn}
                        onChange={value => onChange('publishedOn', value)}
                    />
                    <TextInput
                        label="Url"
                        value={inputValues.url}
                        onChange={value => onChange('url', value)}
                    />
                    <TextInput
                        label="website"
                        value={inputValues.website}
                        onChange={value => onChange('website', value)}
                    />
                </div>
                <div styleName="action-buttons">
                    <PrimaryButton>
                        Submit
                    </PrimaryButton>
                </div>
            </div>
        );
    }
}

export default AddLead;
