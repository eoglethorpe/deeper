import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';

import {
    DangerButton,
    SuccessButton,
} from '../../../../public/components/Action';

import {
    countryDetailSelector,
} from '../../../../common/redux';

import CountryGeneral from '../CountryGeneral';
import CountryKeyFigures from '../CountryKeyFigures';
import CountryMediaSources from '../CountryMediaSources';
import CountryPopulationData from '../CountryPopulationData';
import CountrySeasonalCalendar from '../CountrySeasonalCalendar';
import styles from './styles.scss';

const propTypes = {
    countryDetail: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string,
    }).isRequired,
};

const defaultProps = {
    title: '',
};

const mapStateToProps = state => ({
    countryDetail: countryDetailSelector(state),
    state,
});

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class CountryDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { countryDetail } = this.props;

        return (
            <div styleName="country-detail">
                <div styleName="header">
                    <div styleName="header-title">
                        {countryDetail.title}
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
                            <CountryGeneral countryId={countryDetail.id} />
                        </TabContent>
                        <TabContent
                            for="key-figures"
                            styleName="tab"
                        >
                            <CountryKeyFigures countryId={countryDetail.id} />
                        </TabContent>
                        <TabContent
                            for="population-data"
                            styleName="tab"
                        >
                            <CountryPopulationData countryId={countryDetail.id} />
                        </TabContent>
                        <TabContent
                            for="seasonal-calendar"
                            styleName="tab"
                        >
                            <CountrySeasonalCalendar countryId={countryDetail.id} />
                        </TabContent>
                        <TabContent
                            for="media-sources"
                            styleName="tab"
                        >
                            <CountryMediaSources countryId={countryDetail.id} />
                        </TabContent>
                    </div>
                </Tabs>
            </div>
        );
    }
}
