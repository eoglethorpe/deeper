import CSSModules from 'react-css-modules';
import React from 'react';

import {
    TransparentButton,
} from '../../../public/components/Action';
import {
    FileInput,
} from '../../../public/components/Input';

import DropboxChooser from '../../../common/components/DropboxChooser';
import GooglePicker from '../../../common/components/GooglePicker';

import styles from './styles.scss';

@CSSModules(styles, { allowMultiple: true })
export default class AddLeadFilter extends React.PureComponent {
    render() {
        return (
            <div styleName="add-lead-buttons">
                <h3 styleName="heading">
                    Add new document from:
                </h3>
                <GooglePicker
                    styleName="add-lead-btn"
                >
                    <span className="ion-social-google" />
                    <p>Drive</p>
                </GooglePicker>
                <DropboxChooser
                    styleName="add-lead-btn"
                >
                    <span className="ion-social-dropbox" />
                    <p>Dropbox</p>
                </DropboxChooser>
                <TransparentButton
                    styleName="add-lead-btn"
                >
                    <span className="ion-earth" />
                    <p>DEEP</p>
                </TransparentButton>
                <TransparentButton
                    styleName="add-lead-btn"
                >
                    <span className="ion-clipboard" />
                    <p>ARY</p>
                </TransparentButton>
                <FileInput
                    styleName="add-lead-btn"
                    showStatus={false}
                >
                    <span className="ion-android-upload" />
                    <p>Local disk</p>
                </FileInput>
            </div>
        );
    }
}
