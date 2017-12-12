import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';

import { DangerButton } from '../../../../public/components/Action';
import {
    Confirm,
    LoadingAnimation,
} from '../../../../public/components/View';

import { FgRestBuilder } from '../../../../public/utils/rest';
import {
    createParamsForCountryDelete,
    createUrlForRegion,
} from '../../../../common/rest';

import {
    countryDetailSelector,
    unSetRegionAction,
    activeUserSelector,
} from '../../../../common/redux';

import CountryGeneral from '../CountryGeneral';
import CountryKeyFigures from '../CountryKeyFigures';
import CountryMediaSources from '../CountryMediaSources';
import CountryPopulationData from '../CountryPopulationData';
import CountrySeasonalCalendar from '../CountrySeasonalCalendar';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    countryDetail: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string,
    }).isRequired,
    unSetRegion: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    className: '',
    title: '',
};

const mapStateToProps = state => ({
    countryDetail: countryDetailSelector(state),
    activeUser: activeUserSelector(state),
});

const mapDispatchToProps = dispatch => ({
    unSetRegion: params => dispatch(unSetRegionAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class CountryDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            // Delete Modal state
            deleteCountry: false,
            deletePending: false,
        };
    }

    onClickDeleteButton = () => {
        this.setState({
            deleteCountry: true,
        });
    }

    createRequestForRegionDelete = (regionId) => {
        const urlForRegionDelete = createUrlForRegion(regionId);
        const regionDeleteRequest = new FgRestBuilder()
            .url(urlForRegionDelete)
            .params(() => createParamsForCountryDelete())
            .preLoad(() => {
                this.setState({ deletePending: true });
            })
            .success(() => {
                try {
                    this.props.unSetRegion({ regionId });
                } catch (er) {
                    console.error(er);
                }
            })
            .postLoad(() => {
                this.setState({ deletePending: false });
            })
            .failure((response) => {
                console.info('FAILURE:', response);
            })
            .fatal((response) => {
                console.info('FATAL:', response);
            })
            .build();
        return regionDeleteRequest;
    }

    deleteActiveCountry = (confirm) => {
        if (confirm) {
            const { countryDetail } = this.props;

            if (this.regionDeleteRequest) {
                this.regionDeleteRequest.stop();
            }
            this.regionDeleteRequest = this.createRequestForRegionDelete(
                countryDetail.id);

            this.regionDeleteRequest.start();
        }
        this.setState({ deleteCountry: false });
    }

    render() {
        const {
            deleteCountry,
            deletePending,
        } = this.state;

        const {
            className,
            countryDetail,
            activeUser,
        } = this.props;

        return (
            <div
                className={className}
                styleName="country-detail"
            >
                { deletePending && <LoadingAnimation /> }
                <header styleName="header">
                    <h2>
                        {countryDetail.title}
                    </h2>
                    {
                        activeUser.isSuperuser &&
                            <DangerButton onClick={this.onClickDeleteButton}>
                                Delete Country
                            </DangerButton>
                    }
                    <Confirm
                        show={deleteCountry}
                        closeOnEscape
                        onClose={this.deleteActiveCountry}
                    >
                        <p>{`Are you sure you want to remove Country
                            ${countryDetail.title}?`}</p>
                    </Confirm>
                </header>
                <Tabs
                    activeLinkStyle={{ none: 'none' }}
                    styleName="tabs-container"
                    renderActiveTabContentOnly
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
                    <TabContent
                        for="general"
                        styleName="tab-content"
                    >
                        <CountryGeneral countryId={countryDetail.id} />
                    </TabContent>
                    <TabContent
                        for="key-figures"
                        styleName="tab-content"
                    >
                        <CountryKeyFigures countryId={countryDetail.id} />
                    </TabContent>
                    <TabContent
                        for="population-data"
                        styleName="tab-content"
                    >
                        <CountryPopulationData countryId={countryDetail.id} />
                    </TabContent>
                    <TabContent
                        for="seasonal-calendar"
                        styleName="tab-content"
                    >
                        <CountrySeasonalCalendar countryId={countryDetail.id} />
                    </TabContent>
                    <TabContent
                        for="media-sources"
                        styleName="tab-content"
                    >
                        <CountryMediaSources countryId={countryDetail.id} />
                    </TabContent>
                </Tabs>
            </div>
        );
    }
}
