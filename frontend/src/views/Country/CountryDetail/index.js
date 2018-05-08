import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Prompt } from 'react-router-dom';

import Faram, { requiredCondition } from '../../../vendor/react-store/components/Input/Faram';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import FixedTabs from '../../../vendor/react-store/components/View/FixedTabs';
import MultiViewContainer from '../../../vendor/react-store/components/View/MultiViewContainer';
import Confirm from '../../../vendor/react-store/components/View/Modal/Confirm';
import SuccessButton from '../../../vendor/react-store/components/Action/Button/SuccessButton';
import WarningButton from '../../../vendor/react-store/components/Action/Button/WarningButton';
import LoadingAnimation from '../../../vendor/react-store/components/View/LoadingAnimation';
import {
    countryDetailSelector,
    regionDetailSelector,
    unSetRegionAction,
    activeUserSelector,
    setRegionDetailsAction,
    routeUrlSelector,
} from '../../../redux';
import _ts from '../../../ts';
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
        faramValues: PropTypes.object,
        formFieldErrors: PropTypes.object,
        faramErrors: PropTypes.object,
        pristine: PropTypes.bool,
    }),
    unSetRegion: PropTypes.func.isRequired,
    countryId: PropTypes.number.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setRegionDetails: PropTypes.func.isRequired,

    routeUrl: PropTypes.string.isRequired,
};

const defaultProps = {
    className: '',
    regionDetail: {
        faramValues: {},
        formFieldErrors: {},
        faramErrors: {},
        pristine: false,
    },
    title: '',
};

const mapStateToProps = (state, props) => ({
    countryDetail: countryDetailSelector(state, props),
    regionDetail: regionDetailSelector(state, props),
    activeUser: activeUserSelector(state),
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

        this.routes = {
            general: 'General',
            keyFigures: 'Key figures',
            mediaSources: 'Media sources',
            populationData: 'Population data',
            seasonalCalendar: 'Seasonal calendar',
        };

        this.defaultHash = 'general';

        this.views = {
            general: {
                component: () => (
                    <CountryGeneral
                        dataLoading={this.state.dataLoading}
                        countryId={this.props.countryId}
                    />
                ),
            },
            keyFigures: {
                component: () => (
                    <CountryKeyFigures
                        dataLoading={this.state.dataLoading}
                        countryId={this.props.countryId}
                    />
                ),
            },
            mediaSources: {
                component: () => (
                    <CountryMediaSources
                        dataLoading={this.state.dataLoading}
                        countryId={this.props.countryId}
                    />
                ),
            },
            populationData: {
                component: () => (
                    <CountryPopulationData
                        dataLoading={this.state.dataLoading}
                        countryId={this.props.countryId}
                    />
                ),
            },
            seasonalCalendar: {
                component: () => (
                    <CountrySeasonalCalendar
                        dataLoading={this.state.dataLoading}
                        countryId={this.props.countryId}
                    />
                ),
            },
        };

        this.titles = {
            general: _ts('countries', 'generalTabLabel'),
            keyFigures: _ts('countries', 'keyFiguesTabLabel'),
            mediaSources: _ts('countries', 'mediaTabLabel'),
            populationData: _ts('countries', 'populationTabLabel'),
            seasonalCalendar: _ts('countries', 'seasonalTabLabel'),
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
            setState: v => this.setState(v),
        });
        this.regionDetailPatchRequest = regionDetailPatchRequest.create(regionId, data);
        this.regionDetailPatchRequest.start();
    }

    failureCallback = (formFieldErrors, faramErrors) => {
        const regionDetails = {
            faramValues: { ...this.props.regionDetail.faramValues },
            formFieldErrors: { ...formFieldErrors },
            faramErrors: { ...faramErrors },
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

    handleFaramChange = (faramValues, formFieldErrors, faramErrors) => {
        const regionDetails = {
            faramValues,
            formFieldErrors,
            faramErrors,
            pristine: true,
        };

        const { projectId } = this.props;

        if (projectId) {
            this.props.setRegionDetails({
                regionDetails,
                regionId: this.props.countryId,
                projectId,
            });
        } else {
            this.props.setRegionDetails({
                regionDetails,
                regionId: this.props.countryId,
            });
        }
    };


    deleteActiveCountry = (confirm) => {
        if (confirm) {
            const { countryDetail } = this.props;
            this.startRequestForRegionDelete(countryDetail.id);
        }
        this.setState({ deleteCountry: false });
    }

    renderHeader = () => {
        const { deleteCountry } = this.state;

        const {
            countryDetail,
            activeUser,
        } = this.props;

        const {
            faramErrors = {},
            formFieldErrors = {},
            faramValues = {},
            pristine = false,
        } = this.props.regionDetail;

        return (
            <header className={styles.header} >
                <div className={styles.topContainer} >
                    <h3 className={styles.heading} >
                        {faramValues.title}
                    </h3>
                    <div className={styles.rightContainer} >
                        {
                            activeUser.isSuperuser &&
                            <Fragment>
                                <DangerButton onClick={this.handleDeleteButtonClick}>
                                    {_ts('countries', 'deleteCountryButtonLabel')}
                                </DangerButton>
                                <WarningButton
                                    disabled={!pristine}
                                    onClick={this.handleDiscardButtonClick}
                                >
                                    {_ts('countries', 'discardButtonLabel')}
                                </WarningButton>
                                <SuccessButton
                                    type="submit"
                                    disabled={!pristine}
                                >
                                    {_ts('countries', 'saveButtonLabel')}
                                </SuccessButton>
                            </Fragment>
                        }
                        <Confirm
                            show={deleteCountry}
                            closeOnEscape
                            onClose={this.deleteActiveCountry}
                        >
                            <p>{`${_ts('countries', 'deleteCountryConfirm')}
                                    ${countryDetail.title}?`}
                            </p>
                        </Confirm>
                    </div>
                </div>
                <FixedTabs
                    useHash
                    className={styles.bottomContainer}
                    replaceHistory
                    tabs={this.routes}
                    defaultHash={this.defaultHash}
                />
            </header>
        );
    }

    render() {
        const {
            deletePending,
            dataLoading,
        } = this.state;

        const {
            className,
            countryId,
            activeUser,
        } = this.props;

        const {
            faramErrors = {},
            faramValues = {},
            pristine = false,
        } = this.props.regionDetail;

        const HeaderWithTabs = this.renderHeader;
        const loading = deletePending || dataLoading;

        return (
            <Fragment>
                <Prompt
                    message={
                        (location) => {
                            const { pathname } = location;
                            const { routeUrl } = this.props;

                            if (!pristine || pathname === routeUrl) {
                                return true;
                            }
                            return _ts('common', 'youHaveUnsavedChanges');
                        }
                    }
                />
                <div className={`${className} ${styles.countryDetail}`}>
                    <Faram
                        onChange={this.handleFaramChange}
                        onValidationFailure={this.handleValidationFailure}
                        onValidationSuccess={this.handleValidationSuccess}
                        schema={this.schema}
                        value={faramValues}
                        error={faramErrors}
                        disabled={loading}
                    >
                        { loading &&
                            <LoadingAnimation
                                className={styles.loadingAnimation}
                                large
                            />
                        }
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
                                <HeaderWithTabs />
                                <MultiViewContainer
                                    useHash
                                    views={this.views}
                                />
                            </Fragment>
                        )}
                    </Faram>
                </div>
            </Fragment>
        );
    }
}
