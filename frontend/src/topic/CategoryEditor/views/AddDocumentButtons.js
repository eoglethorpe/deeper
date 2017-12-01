import CSSModules from 'react-css-modules';
import React from 'react';

import {
    TransparentButton,
} from '../../../public/components/Action';

import styles from './styles.scss';

@CSSModules(styles, { allowMultiple: true })
export default class AddLeadFilter extends React.PureComponent {
    render() {
        return (
            <div styleName="add-lead-buttons">
                <h3 styleName="heading">
                    Add new document from:
                </h3>
                <TransparentButton styleName="add-lead-btn" >
                    <span className="ion-social-google" />
                    <p>Drive</p>
                </TransparentButton>
                <TransparentButton styleName="add-lead-btn" >
                    <span className="ion-social-dropbox" />
                    <p>Dropbox</p>
                </TransparentButton>
                <TransparentButton styleName="add-lead-btn" >
                    <span className="ion-earth" />
                    <p>DEEP</p>
                </TransparentButton>
                <TransparentButton styleName="add-lead-btn" >
                    <span className="ion-clipboard" />
                    <p>ARY</p>
                </TransparentButton>
                <TransparentButton styleName="add-lead-btn" >
                    <span className="ion-android-upload" />
                    <p>Local disk</p>
                </TransparentButton>
            </div>
        );
    }
}
