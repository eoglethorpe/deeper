import CSSModules from 'react-css-modules';
import React from 'react';

import {
    TransparentButton,
} from '../../../public/components/Action';
import {
    iconNames,
} from '../../../common/constants';

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
                    <span className={iconNames.googleDrive} />
                    <p>Drive</p>
                </TransparentButton>
                <TransparentButton styleName="add-lead-btn" >
                    <span className={iconNames.dropbox} />
                    <p>Dropbox</p>
                </TransparentButton>
                <TransparentButton styleName="add-lead-btn" >
                    <span className={iconNames.globe} />
                    <p>DEEP</p>
                </TransparentButton>
                <TransparentButton styleName="add-lead-btn" >
                    <span className={iconNames.clipboard} />
                    <p>ARY</p>
                </TransparentButton>
                <TransparentButton styleName="add-lead-btn" >
                    <span className={iconNames.upload} />
                    <p>Local disk</p>
                </TransparentButton>
            </div>
        );
    }
}
