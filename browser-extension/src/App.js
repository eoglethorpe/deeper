import CSSModules from 'react-css-modules';
import React, { Component } from 'react';
import styles from './stylesheets/styles.scss';

@CSSModules(styles, { allowMultiple: true })
class App extends Component {
    render() {
        return (
            <div styleName="app">
                <header styleName="header">
                    Deep Extension
                </header>
                <p styleName="intro">
                    This is the extension for humans.
                </p>
            </div>
        );
    }
}

export default App;
