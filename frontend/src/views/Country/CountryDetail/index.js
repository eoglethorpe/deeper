import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import {
    Redirect,
    Route,
    HashRouter,
    NavLink,
    Prompt,
} from 'react-router-dom';

import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import List from '../../../vendor/react-store/components/View/List';
import Confirm from '../../../vendor/react-store/components/View/Modal/Confirm';
import SuccessButton from '../../../vendor/react-store/components/Action/Button/SuccessButton';
import WarningButton from '../../../vendor/react-store/components/Action/Button/WarningButton';
import LoadingAnimation from '../../../vendor/react-store/components/View/LoadingAnimation';
import Form, {
    requiredCondition,
} from '../../../vendor/react-store/components/Input/Form';

import {
    countryDetailSelector,
    regionDetailSelector,
    unSetRegionAction,
    activeUserSelector,
    notificationStringsSelector,
    countriesStringsSelector,
    setRegionDetailsAction,
    commonStringsSelector,
    routeUrlSelector,
} from '../../../redux';
import RegionDetailView from '../../../components/RegionDetailView';
import RegionMap from '../../../components/RegionMap';

import RegionDeleteRequest from '../requests/RegionDeleteRequest';
import RegionGetRequest from '../requests/RegionGetRequest';
import RegionDetailPatchRequest from '../requests/RegionDetailPatchRequest';

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
    regionDetail: PropTypes.shape({
        formValues: PropTypes.object,
        formFieldErrors: PropTypes.object,
        formErrors: PropTypes.object,
        pristine: PropTypes.bool,
    }),
    unSetRegion: PropTypes.func.isRequired,
    countryId: PropTypes.number.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    notificationStrings: PropTypes.func.isRequired,
    countriesStrings: PropTypes.func.isRequired,
    commonStrings: PropTypes.func.isRequired,
    setRegionDetails: PropTypes.func.isRequired,

    routeUrl: PropTypes.string.isRequired,
};

const defaultProps = {
    className: '',
    regionDetail: {
        formValues: {},
        formFieldErrors: {},
        formErrors: {},
        pristine: false,
    },
    title: '',
};

const mapStateToProps = (state, props) => ({
    countryDetail: countryDetailSelector(state, props),
    regionDetail: regionDetailSelector(state, props),
    activeUser: activeUserSelector(state),
    notificationStrings: notificationStringsSelector(state),
    countriesStrings: countriesStringsSelector(state),
    commonStrings: commonStringsSelector(state),
    routeUrl: routeUrlSelector(state),
});

const mapDispatchToProps = dispatch => ({
    unSetRegion: params => dispatch(unSetRegionAction(params)),
    setRegionDetails: params => dispatch(setRegionDetailsAction(params)),
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
            dataLoading: true,
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

        this.schema = {
            fields: {
                code: [requiredCondition],
                title: [requiredCondition],
                regionalGroups: {
                    fields: {
                        wbRegion: [],
                        wbIncomeRegion: [],
                        ochaRegion: [],
                        echoRegion: [],
                        unGeoRegion: [],
                        unGeoSubregion: [],
                    },
                },
                keyFigures: {
                    fields: {
                        index: [],
                        geoRank: [],
                        geoScore: [],
                        geoScoreU5m: [],
                        rank: [],
                        u5m: [],
                        numberOfRefugees: [],
                        percentageUprootedPeople: [],
                        geoScoreUprooted: [],
                        numberIdp: [],
                        numberReturnedRefugees: [],
                        riskClass: [],
                        hazardAndExposure: [],
                        vulnerability: [],
                        informRiskIndex: [],
                        lackOfCopingCapacity: [],
                    },
                },
            },
        };
    }

    componentWillMount() {
        this.startRegionRequest(this.props.countryId, false);
    }

    componentWillUnmount() {
        if (this.regionDeleteRequest) {
            this.regionDeleteRequest.stop();
        }
        if (this.requestForRegion) {
            this.requestForRegion.stop();
        }
        if (this.regionDetailPatchRequest) {
            this.regionDetailPatchRequest.stop();
        }
    }

    handleDeleteButtonClick = () => {
        this.setState({ deleteCountry: true });
    }

    handleDiscardButtonClick = () => {
        this.startRegionRequest(this.props.countryId, true);
    }

    startRegionRequest = (regionId, discard) => {
        if (this.requestForRegion) {
            this.requestForRegion.stop();
        }
        const requestForRegion = new RegionGetRequest({
            setRegionDetails: this.props.setRegionDetails,
            setState: v => this.setState(v),
            notificationStrings: this.props.notificationStrings,
            regionDetail: this.props.regionDetail || {},
            discard,
        });
        this.requestForRegion = requestForRegion.create(regionId);
        this.requestForRegion.start();
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

    startRequestForRegionDetailPatch = (regionId, data) => {
        if (this.regionDetailPatchRequest) {
            this.regionDetailPatchRequest.stop();
        }
        const regionDetailPatchRequest = new RegionDetailPatchRequest({
            setRegionDetails: this.props.setRegionDetails,
            countriesStrings: this.props.countriesStrings,
            notificationStrings: this.props.notificationStrings,
            setState: v => this.setState(v),
        });
        this.regionDetailPatchRequest = regionDetailPatchRequest.create(regionId, data);
        this.regionDetailPatchRequest.start();
    }

    failureCallback = (formFieldErrors, formErrors) => {
        const regionDetails = {
            formValues: { ...this.props.regionDetail.formValues },
            formFieldErrors: { ...formFieldErrors },
            formErrors: { ...formErrors },
            pristine: true,
        };
        this.props.setRegionDetails({
            regionDetails,
            regionId: this.props.countryId,
        });
    };

    successCallback = (values) => {
        this.startRequestForRegionDetailPatch(this.props.countryId, values);
    };

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

        return (
            <Route
                key={key}
                path={this.pathNames[routeId]}
                exact
                render={() => (
                    <Component
                        dataLoading={this.state.dataLoading}
                        countryId={this.props.countryId}
                    />
                )}
            />
        );
    }

    renderHeader = () => {
        const { deleteCountry } = this.state;

        const {
            countryDetail,
            activeUser,
            countriesStrings,
            regionDetail,
        } = this.props;

        const {
            formErrors = {},
            formFieldErrors = {},
            formValues = {},
            pristine = false,
        } = this.props.regionDetail;

        return (
            <header className={styles.header} >
                <div className={styles.topContainer} >
                    <h3 className={styles.heading} >
                        {regionDetail.title}
                    </h3>
                    <div className={styles.rightContainer} >
                        {
                            activeUser.isSuperuser &&
                            <Fragment>
                                <DangerButton onClick={this.handleDeleteButtonClick}>
                                    {countriesStrings('deleteCountryButtonLabel')}
                                </DangerButton>
                                <Form
                                    failureCallback={this.failureCallback}
                                    successCallback={this.successCallback}
                                    schema={this.schema}
                                    fieldErrors={formFieldErrors}
                                    formErrors={formErrors}
                                    value={formValues}
                                >
                                    <WarningButton
                                        disabled={!pristine}
                                        onClick={this.handleDiscardButtonClick}
                                    >
                                        {countriesStrings('discardButtonLabel')}
                                    </WarningButton>
                                    <SuccessButton
                                        type="submit"
                                        disabled={!pristine}
                                    >
                                        {countriesStrings('saveButtonLabel')}
                                    </SuccessButton>
                                </Form>
                            </Fragment>
                        }
                        <Confirm
                            show={deleteCountry}
                            closeOnEscape
                            onClose={this.deleteActiveCountry}
                        >
                            <p>{`${countriesStrings('deleteCountryConfirm')}
                                    ${countryDetail.title}?`}
                            </p>
                        </Confirm>
                    </div>
                </div>
                <div className={styles.tabs}>
                    <List
                        data={this.routes}
                        modifier={this.renderLink}
                        keyExtractor={CountryDetail.keyExtractor}
                    />
                    <div className={styles.rightContainer} />
                </div>
            </header>
        );
    }

    render() {
        const {
            deletePending,
        } = this.state;

        const {
            className,
            countryId,
            activeUser,
        } = this.props;

        const {
            pristine,
        } = this.props.regionDetail;

        const HeaderWithTabs = this.renderHeader;

        return (
            <Fragment>
                <Prompt
                    message={
                        (location) => {
                            const { pathname } = location;
                            const {
                                routeUrl,
                                commonStrings,
                            } = this.props;

                            if (!pristine || pathname === routeUrl) {
                                return true;
                            }
                            return commonStrings('youHaveUnsavedChanges');
                        }
                    }
                />
                <HashRouter>
                    <div className={`${className} ${styles.countryDetail}`}>
                        { deletePending && <LoadingAnimation large /> }
                        <Route
                            exact
                            path="/"
                            component={() => <Redirect to={this.pathNames[this.defaultRoute]} />}
                        />
                        { !activeUser.isSuperuser ? (
                            <div className={styles.detailsNoEdit}>
                                <RegionDetailView
                                    className={styles.regionDetailBox}
                                    countryId={countryId}
                                />
                                <div className={styles.mapContainer}>
                                    <RegionMap regionId={countryId} />
                                </div>
                            </div>
                        ) : (
                            <Fragment>
                                <HeaderWithTabs key="header" />
                                <List
                                    key="list"
                                    data={this.routes}
                                    modifier={this.renderRoute}
                                    keyExtractor={CountryDetail.keyExtractor}
                                />
                            </Fragment>
                        )}
                    </div>
                </HashRouter>
            </Fragment>
        );
    }
}
