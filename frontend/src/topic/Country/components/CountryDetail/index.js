import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';

import CountryGeneral from '../CountryGeneral';
import CountryKeyFigures from '../CountryKeyFigures';
import CountryMediaSources from '../CountryMediaSources';
import CountryPopulationData from '../CountryPopulationData';
import CountrySeasonalCalendar from '../CountrySeasonalCalendar';
import styles from './styles.scss';
import { DangerButton, SuccessButton } from '../../../../public/components/Button';

const propTypes = {
    countryId: PropTypes.number.isRequired,
    fullName: PropTypes.string,
};

const defaultProps = {
    fullName: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class CountryDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { fullName, countryId } = this.props;

        return (
            <div styleName="country-detail">
                <div styleName="header">
                    <div styleName="header-title">
                        {`${countryId}${fullName}`}
                    </div>
                    <div styleName="button-container">
                        <SuccessButton className="save-btn">
                            Save Changes
                        </SuccessButton>
                        <DangerButton>
                            Delete Country
                        </DangerButton>
                    </div>
                </div>
                <Tabs
                    activeLinkStyle={{ none: 'none' }}
                    styleName="tabs-container"
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
                        {/* Essential for border bottom, for more info contact AdityaKhatri */}
                        <div styleName="empty-tab" />
                    </div>
                    <div styleName="tabs-content">
                        <TabContent
                            for="general"
                            styleName="tab"
                        >
                            <CountryGeneral countryId={countryId} />
                        </TabContent>
                        <TabContent
                            for="key-figures"
                            styleName="tab"
                        >
                            <CountryKeyFigures countryId={countryId} />
                        </TabContent>
                        <TabContent
                            for="population-data"
                            styleName="tab"
                        >
                            <CountryPopulationData countryId={countryId} />
                        </TabContent>
                        <TabContent
                            for="seasonal-calendar"
                            styleName="tab"
                        >
                            <CountrySeasonalCalendar countryId={countryId} />
                        </TabContent>
                        <TabContent
                            for="media-sources"
                            styleName="tab"
                        >
                            <CountryMediaSources countryId={countryId} />
                        </TabContent>
                    </div>
                </Tabs>
            </div>
        );
    }
}
