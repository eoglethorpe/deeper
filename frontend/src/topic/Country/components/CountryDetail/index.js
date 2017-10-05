import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';

import { DangerButton, SuccessButton } from '../../../../public/components/Button';
import CountryGeneral from '../CountryGeneral';
import CountryKeyFigures from '../CountryKeyFigures';
import CountryPopulationData from '../CountryPopulationData';
import CountrySeasonalCalendar from '../CountrySeasonalCalendar';
import CountryMediaSources from '../CountryMediaSources';
import styles from './styles.scss';

@CSSModules(styles, { allowMultiple: true })
export default class CountryDetail extends React.PureComponent {
    static propTypes = {
        fullName: PropTypes.string.isRequired,
        iso: PropTypes.string.isRequired,
    }

    render() {
        const { fullName, iso } = this.props;

        return (
            <div styleName="country-detail">
                <div styleName="header">
                    <div styleName="header-title">
                        {fullName}
                    </div>
                    <div styleName="button-container">
                        <SuccessButton>Save Changes</SuccessButton>
                        <DangerButton>Delete Country</DangerButton>
                    </div>
                </div>
                <Tabs
                    styleName="tabs-container"
                    activeLinkStyle={{ none: 'none' }}
                >
                    <div styleName="tabs-header-container">
                        <TabLink
                            styleName="tab-header"
                            to="general"
                        >
                            general
                        </TabLink>
                        <TabLink
                            styleName="tab-header"
                            to="key-figures"
                        >
                            key figures
                        </TabLink>
                        <TabLink
                            styleName="tab-header"
                            to="population-data"
                        >
                           Population data
                        </TabLink>
                        <TabLink
                            styleName="tab-header"
                            to="seasonal-calendar"
                        >
                           Seasonal Calendar
                        </TabLink>
                        <TabLink
                            styleName="tab-header"
                            to="media-sources"
                        >
                            Media Sources
                        </TabLink>
                        <TabLink styleName="empty-tab" />
                    </div>
                    <div styleName="tabs-content">
                        <TabContent for="general" styleName="tab">
                            <CountryGeneral iso={iso} />
                        </TabContent>
                        <TabContent for="key-figures" styleName="tab">
                            <CountryKeyFigures iso={iso} />
                        </TabContent>
                        <TabContent for="population-data" styleName="tab">
                            <CountryPopulationData iso={iso} />
                        </TabContent>
                        <TabContent for="seasonal-calendar" styleName="tab">
                            <CountrySeasonalCalendar iso={iso} />
                        </TabContent>
                        <TabContent for="media-sources" styleName="tab">
                            <CountryMediaSources iso={iso} />
                        </TabContent>
                    </div>
                </Tabs>
            </div>
        );
    }
}

