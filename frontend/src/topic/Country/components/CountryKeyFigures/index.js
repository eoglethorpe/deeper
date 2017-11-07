import CSSModules from 'react-css-modules';
import React from 'react';

import styles from './styles.scss';
import {
    TextInput,
} from '../../../../public/components/Input';

@CSSModules(styles, { allowMultiple: true })
export default class CountryKeyFigures extends React.PureComponent {
    render() {
        return (
            <div styleName="key-figures">
                <div styleName="hdi">
                    <h3>
                     Human Development Index
                        <a
                            href="http://www.hdr.undp.org/en/countries"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span
                                className="ion-link"
                                styleName="icon"
                                title="Click to open"
                            />
                        </a>
                    </h3>
                    <TextInput
                        label="INDEX"
                        styleName="index"
                        type="number"
                        step="any"
                        min="0"
                        max="1"
                    />
                    <TextInput
                        label="GEO-RANK"
                        styleName="geo-rank"
                        readOnly
                    />
                    <TextInput
                        label="GEO-SCORE"
                        styleName="geo-score"
                        readOnly
                    />
                    <TextInput
                        label="RANK"
                        styleName="rank"
                    />
                </div>
                <div styleName="under-five-mortality-rate">
                    <h3>
                     UNDER FIVE MORTALITY RATE (per 1.000 live births)
                        <a
                            href="http://www.inform-index.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span
                                className="ion-link"
                                styleName="icon"
                                title="Click to open"
                            />
                        </a>
                    </h3>
                    <TextInput
                        label="U5M"
                        styleName="u5m"
                    />
                    <TextInput
                        label="GEO SCORE"
                        styleName="geo-score-u5m"
                        readOnly
                    />
                </div>
                <div styleName="uprooted-people">
                    <h3>
                     UPROOTED PEOPLE (refugees + IDPs + returned refugees)
                        <a
                            href="http://www.inform-index.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span
                                className="ion-link"
                                styleName="icon"
                                title="Click to open"
                            />
                        </a>
                    </h3>
                    <TextInput
                        label="Number of Refugees"
                        styleName="number-of-refugees"
                    />
                    <TextInput
                        label="Percentage of Uprooted People"
                        styleName="percentage-uprooted-people"
                        readOnly
                    />
                    <TextInput
                        label="GEO-SCORE"
                        styleName="geo-score-uprooted"
                        readOnly
                    />
                    <TextInput
                        label="Number of IDPs"
                        styleName="number-idp"
                    />
                    <TextInput
                        label="Number of returned refugees"
                        styleName="number-returned-refugees"
                    />
                </div>
                <div styleName="inform-score">
                    <h3>
                    Inform Score
                        <a
                            href="http://www.hdr.undp.org/en/countries"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span
                                className="ion-link"
                                styleName="icon"
                                title="Click to open"
                            />
                        </a>
                    </h3>
                    <TextInput
                        label="Risk Calss"
                        styleName="risk-class"
                    />
                    <TextInput
                        label="Inform Risk Index"
                        styleName="inform-risk-index"
                    />
                    <TextInput
                        label="Hazard and Exposure"
                        styleName="hazard-and-exposure"
                    />
                    <TextInput
                        label="Vulnerability"
                        styleName="vulnerability"
                    />
                    <TextInput
                        label="Lack of Coping Capacity"
                        styleName="lack-of-coping-capacity"
                    />
                </div>
            </div>
        );
    }
}
