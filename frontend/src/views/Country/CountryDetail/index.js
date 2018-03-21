import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';

import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import Confirm from '../../../vendor/react-store/components/View/Modal/Confirm';
import LoadingAnimation from '../../../vendor/react-store/components/View/LoadingAnimation';

import {
    createParamsForCountryDelete,
    createUrlForRegion,
} from '../../../rest';
import {
    countryDetailSelector,
    unSetRegionAction,
    activeUserSelector,
    notificationStringsSelector,
    countriesStringsSelector,
} from '../../../redux';
import RegionDetailView from '../../../components/RegionDetailView';
import RegionMap from '../../../components/RegionMap';
import notify from '../../../notify';

import CountryGeneral from './CountryGeneral';
import CountryKeyFigures from './CountryKeyFigures';
import CountryMediaSources from './CountryMediaSources';
import CountryPopulationData from './CountryPopulationData';
import CountrySeasonalCalendar from './CountrySeasonalCalendar';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    countryDetail: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string,
    }).isRequired,
    unSetRegion: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    notificationStrings: PropTypes.func.isRequired,
    countriesStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    title: '',
};

const mapStateToProps = (state, props) => ({
    countryDetail: countryDetailSelector(state, props),
    activeUser: activeUserSelector(state),
    notificationStrings: notificationStringsSelector(state),
    countriesStrings: countriesStringsSelector(state),
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
                // FIXME: write schema
                try {
                    this.props.unSetRegion({ regionId });
                    notify.send({
                        title: this.props.notificationStrings('countryDelete'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('countryDeleteSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .postLoad(() => {
                this.setState({ deletePending: false });
            })
            .failure(() => {
                notify.send({
                    title: this.props.notificationStrings('countryDelete'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('countryDeleteFailure'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.notificationStrings('countryDelete'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('countryDeleteFatal'),
                    duration: notify.duration.SLOW,
                });
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
            <div className={`${className} ${styles.countryDetail}`}>
                { deletePending && <LoadingAnimation /> }
                <header className={styles.header}>
                    <h2>
                        {countryDetail.title}
                    </h2>
                    {
                        activeUser.isSuperuser &&
                            <DangerButton onClick={this.onClickDeleteButton}>
                                {this.props.countriesStrings('deleteCountryButtonLabel')}
                            </DangerButton>
                    }
                    <Confirm
                        show={deleteCountry}
                        closeOnEscape
                        onClose={this.deleteActiveCountry}
                    >
                        <p>{`${this.props.countriesStrings('deleteCountryConfirm')}
                            ${countryDetail.title}?`}</p>
                    </Confirm>
                </header>
                { !activeUser.isSuperuser ? (
                    <div className={styles.detailsNoEdit}>
                        <RegionDetailView
                            className={styles.regionDetailBox}
                            countryId={countryDetail.id}
                        />
                        <div className={styles.mapContainer}>
                            <RegionMap regionId={countryDetail.id} />
                        </div>
                    </div>
                ) : (
                    <Tabs
                        activeLinkStyle={{ none: 'none' }}
                        className={styles.tabsContainer}
                        renderActiveTabContentOnly
                    >
                        <div className={styles.tabsHeaderContainer}>
                            <TabLink
                                className={styles.tabHeader}
                                to="general"
                            >
                                {this.props.countriesStrings('generalTabLabel')}
                            </TabLink>
                            <TabLink
                                className={styles.tabHeader}
                                to="key-figures"
                            >
                                {this.props.countriesStrings('keyFiguesTabLabel')}
                            </TabLink>
                            <TabLink
                                className={styles.tabHeader}
                                to="population-data"
                            >
                                {this.props.countriesStrings('populationTabLabel')}
                            </TabLink>
                            <TabLink
                                className={styles.tabHeader}
                                to="seasonal-calendar"
                            >
                                {this.props.countriesStrings('seasonalTabLabel')}
                            </TabLink>
                            <TabLink
                                className={styles.tabHeader}
                                to="media-sources"
                            >
                                {this.props.countriesStrings('mediaTabLabel')}
                            </TabLink>
                            {/* Essential for border bottom, for more info contact AdityaKhatri */}
                            <div className={styles.emptyTab} />
                        </div>
                        <TabContent
                            for="general"
                            className={styles.tabContent}
                        >
                            <CountryGeneral countryId={countryDetail.id} />
                        </TabContent>
                        <TabContent
                            for="key-figures"
                            className={styles.tabContent}
                        >
                            <CountryKeyFigures countryId={countryDetail.id} />
                        </TabContent>
                        <TabContent
                            for="population-data"
                            className={styles.tabContent}
                        >
                            <CountryPopulationData
                                countryId={countryDetail.id}
                            />
                        </TabContent>
                        <TabContent
                            for="seasonal-calendar"
                            className={styles.tabContent}
                        >
                            <CountrySeasonalCalendar
                                countryId={countryDetail.id}
                            />
                        </TabContent>
                        <TabContent
                            for="media-sources"
                            className={styles.tabContent}
                        >
                            <CountryMediaSources
                                countryId={countryDetail.id}
                            />
                        </TabContent>
                    </Tabs>
                )}
            </div>
        );
    }
}
