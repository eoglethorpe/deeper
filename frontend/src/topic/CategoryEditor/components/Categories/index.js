import CSSModules from 'react-css-modules';
import React from 'react';
import {
    PrimaryButton,
    TransparentButton,
} from '../../../../public/components/Action';
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
                        <PrimaryButton>
                            WASH
                        </PrimaryButton>
                        <TransparentButton>
                            FOOD
                        </TransparentButton>
                        <TransparentButton>
                            SHELTER
                        </TransparentButton>
                        <TransparentButton>
                            NFI
                        </TransparentButton>
                        <TransparentButton>
                            PROTECTION
                        </TransparentButton>
                        <TransparentButton>
                            <i className="ion-plus" />
                        </TransparentButton>
                    </div>
                    <div styleName="sub-sub-categories">
                        <TransparentButton>
                            WATER
                        </TransparentButton>
                        <TransparentButton>
                            SANITATION
                        </TransparentButton>
                        <PrimaryButton>
                            HYGIENE
                        </PrimaryButton>
                        <TransparentButton>
                            VECTOR CONTROL
                        </TransparentButton>
                        <TransparentButton>
                            WASTE MANAGEMENT
                        </TransparentButton>
                        <TransparentButton>
                            DISAESES
                        </TransparentButton>
                        <TransparentButton>
                            <i className="ion-plus" />
                        </TransparentButton>
                    </div>
                    <KeyWords />
                </div>
            </div>
        );
    }
}
