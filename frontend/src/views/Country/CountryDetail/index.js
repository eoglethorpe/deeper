import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    Redirect,
    Route,
    HashRouter,
    NavLink,
} from 'react-router-dom';

import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import List from '../../../vendor/react-store/components/View/List';
import Confirm from '../../../vendor/react-store/components/View/Modal/Confirm';
import LoadingAnimation from '../../../vendor/react-store/components/View/LoadingAnimation';

import {
    countryDetailSelector,
    unSetRegionAction,
    activeUserSelector,
    notificationStringsSelector,
    countriesStringsSelector,
} from '../../../redux';
import RegionDetailView from '../../../components/RegionDetailView';
import RegionMap from '../../../components/RegionMap';

import RegionDeleteRequest from '../requests/RegionDeleteRequest';

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
export default class CountryDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static keyExtractor = d => d;

    constructor(props) {
        super(props);

        this.state = {
            // Delete Modal state
            deleteCountry: false,
            deletePending: false,
        };

        this.routes = [
            'general',
            'keyFigures',
            'mediaSources',
            'populationData',
            'seasonalCalendar',
        ];

        this.defaultRoute = 'general';

        this.pathNames = {
            general: '/general',
            keyFigures: '/key-figures',
            mediaSources: '/media-sources',
            populationData: '/population-data',
            seasonalCalendar: '/seasonal-calendar',
        };

        this.views = {
            general: CountryGeneral,
            keyFigures: CountryKeyFigures,
            mediaSources: CountryMediaSources,
            populationData: CountryPopulationData,
            seasonalCalendar: CountrySeasonalCalendar,
        };

        this.titles = {
            general: props.countriesStrings('generalTabLabel'),
            keyFigures: props.countriesStrings('keyFiguesTabLabel'),
            mediaSources: props.countriesStrings('mediaTabLabel'),
            populationData: props.countriesStrings('populationTabLabel'),
            seasonalCalendar: props.countriesStrings('seasonalTabLabel'),
        };
    }

    componentWillUnmount() {
        if (this.regionDeleteRequest) {
            this.regionDeleteRequest.stop();
        }
    }

    onClickDeleteButton = () => {
        this.setState({
            deleteCountry: true,
        });
    }

    startRequestForRegionDelete = (regionId) => {
        if (this.regionDeleteRequest) {
            this.regionDeleteRequest.stop();
        }
        const regionDeleteRequest = new RegionDeleteRequest({
            unSetRegion: this.props.unSetRegion,
            notificationStrings: this.props.notificationStrings,
            setState: v => this.setState(v),
        });
        this.regionDeleteRequest = regionDeleteRequest.create(regionId);
        this.regionDeleteRequest.start();
    }

    deleteActiveCountry = (confirm) => {
        if (confirm) {
            const { countryDetail } = this.props;
            this.startRequestForRegionDelete(countryDetail.id);
        }
        this.setState({ deleteCountry: false });
    }

    renderLink = (key, routeId) => (
        <NavLink
            key={key}
            to={this.pathNames[routeId]}
            activeClassName={styles.active}
            className={styles.tab}
            replace
            exact
        >
            { this.titles[routeId] }
        </NavLink>
    )

    renderRoute = (key, routeId) => {
        const Component = this.views[routeId];
        const { projectId } = this.props;

        return (
            <Route
                key={key}
                path={this.pathNames[routeId]}
                exact
                render={() => (
                    <Component
                        mainHistory={this.props.mainHistory}
                        className={styles.content}
                        projectId={projectId}
                    />
                )}
            />
        );
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
            countriesStrings,
        } = this.props;

        return (
            <HashRouter>
                <div className={`${className} ${styles.countryDetail}`}>
                    { deletePending && <LoadingAnimation /> }
                    <Route
                        exact
                        path="/"
                        component={() => <Redirect to={this.pathNames[this.defaultRoute]} />}
                    />
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
                    ) : ([
                        <header
                            key="header"
                            className={styles.header}
                        >
                            <div className={styles.tabs}>
                                <List
                                    data={this.routes}
                                    modifier={this.renderLink}
                                    keyExtractor={CountryDetail.keyExtractor}
                                />
                                <div className={styles.rightContainer}>
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
                                </div>
                            </div>
                        </header>,
                        <List
                            key="list"
                            data={this.routes}
                            modifier={this.renderRoute}
                            keyExtractor={CountryDetail.keyExtractor}
                        />,
                    ])}
                </div>
            </HashRouter>
        );
    }
}
