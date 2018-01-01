import CSSModules from 'react-css-modules';
import React, { Component } from 'react';
import {
    DateInput,
    SelectInput,
    TextInput,
} from './public-components/Input';

import styles from './app.scss';

@CSSModules(styles, { allowMultiple: true })
class App extends Component {
    render() {
        return (
            <div styleName="app">
                <SelectInput
                    label="Project"
                />
                <TextInput
                    label="Title"
                />
                <TextInput
                    label="Source"
                />
                <SelectInput
                    label="Confidentiality"
                />
                <SelectInput
                    label="Assigned to"
                />
                <DateInput
                    label="Assigned to"
                />
                <TextInput
                    label="Url"
                />
                <TextInput
                    label="website"
                />
            </div>
        );
    }
}

export default App;
