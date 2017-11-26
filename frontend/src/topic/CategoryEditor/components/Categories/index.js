import CSSModules from 'react-css-modules';
import React from 'react';
import styles from './styles.scss';
import KeyWords from '../../components/KeyWords';


@CSSModules(styles, { allowMultiple: true })
export default class Categories extends React.PureComponent {
    render() {
        return (
            <div styleName="categories">
                <h2>
                    1. Sectors
                </h2>
                <div styleName="category-group">
                    <div styleName="sub-categories">
                        <div styleName="clicked">
                            WASH
                        </div>
                        <div styleName="not-clicked">
                            FOOD
                        </div>
                        <div styleName="not-clicked">
                            SHELTER
                        </div>
                        <div styleName="not-clicked">
                            NFI
                        </div>
                        <div styleName="not-clicked">
                            PROTECTION
                        </div>
                        <div styleName="not-clicked">
                            <i className="ion-plus" />
                        </div>
                    </div>
                    <div styleName="sub-sub-categories">
                        <div styleName="not-clicked">
                            WATER
                        </div>
                        <div styleName="not-clicked">
                            SANITATION
                        </div>
                        <div styleName="clicked">
                            HYGIENE
                        </div>
                        <div styleName="not-clicked">
                            VECTOR CONTROL
                        </div>
                        <div styleName="not-clicked">
                            WASTE MANAGEMENT
                        </div>
                        <div styleName="not-clicked">
                            DISAESES
                        </div>
                        <div styleName="not-clicked">
                            <i className="ion-plus" />
                        </div>
                    </div>
                    <KeyWords />
                </div>
            </div>
        );
    }
}
