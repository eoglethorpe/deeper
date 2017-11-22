import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { RestBuilder } from '../../../public/utils/rest';
import {
    TextInput,
    requiredCondition,
} from '../../../public/components/Input';
import {
    PrimaryButton,
} from '../../../public/components/Action';
import {
    ListItem,
    ListView,
    Modal,
    ModalHeader,
} from '../../../public/components/View';

import browserHistory from '../../../common/browserHistory';
import { pageTitles } from '../../../common/utils/labels';
import schema from '../../../common/schema';
import {
    createParamsForUser,
    urlForRegions,
} from '../../../common/rest';
import {
    tokenSelector,

    activeCountrySelector,
    countriesListSelector,

    setNavbarStateAction,

    setActiveCountryAction,
    setRegionsAction,
} from '../../../common/redux';

import CountryDetail from '../components/CountryDetail';
import AddCountry from '../components/AddCountry';
import styles from './styles.scss';

const propTypes = {
    activeCountry: PropTypes.number,
    countries: PropTypes.array, // eslint-disable-line
    match: PropTypes.shape({
        params: PropTypes.shape({
            countryId: PropTypes.string,
        }),
    }),
    setRegions: PropTypes.func.isRequired,
    setActiveCountry: PropTypes.func.isRequired,
    setNavbarState: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
    location: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    activeCountry: undefined,
    match: undefined,
    location: {},
    countries: [],
};

// TODO:
// Scroll to selected country

const mapStateToProps = state => ({
    activeCountry: activeCountrySelector(state),
    countries: countriesListSelector(state),
    token: tokenSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setRegions: params => dispatch(setRegionsAction(params)),
    setActiveCountry: params => dispatch(setActiveCountryAction(params)),
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class CountryPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            addCountryModal: false,
            displayCountryList: this.props.countries,
            searchInputValue: '',
        };

        this.elements = [
            'name',
            'code',
        ];
        this.validations = {
            name: [requiredCondition],
            code: [requiredCondition],
        };

        this.countriesRequest = this.createRequestforCountries();
    }

    componentWillMount() {
        // Set navbar state
        this.props.setNavbarState({
            visible: true,
            activeLink: undefined,
            validLinks: [
                pageTitles.leads,
                pageTitles.entries,
                pageTitles.ary,
                pageTitles.weeklySnapshot,
                pageTitles.export,

                pageTitles.userProfile,
                pageTitles.adminPanel,
                pageTitles.projectPanel,
                pageTitles.countryPanel,
            ],
        });

        const {
            countries,
            activeCountry,
            match,
            setActiveCountry,
        } = this.props;
        const { countryId } = match.params;

        // Override activeCountry by url value
        if (countryId) {
            console.log('Id from browser found');
            setActiveCountry({ activeCountry: +countryId });
        } else if (activeCountry) {
            console.log('Redirecting to currently active country');
            browserHistory.push(`/countrypanel/${activeCountry}/`);
            // NOTE: this breaks here
        } else if (countries.length > 0) {
            console.log('Setting first country as active');
            // dont do this now
            const newActiveCountry = countries[0].id;
            setActiveCountry({ activeCountry: newActiveCountry });
            browserHistory.push(`/countrypanel/${newActiveCountry}/`);
        }

        this.countriesRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.countries !== nextProps.countries) {
            // Re-sorting logic
            const { searchInputValue } = this.state;
            const caseInsensitiveSubmatch = (country) => {
                if (country.title) {
                    const countryTitle = country.title.toLowerCase();
                    const searchTitle = searchInputValue.toLowerCase();
                    return countryTitle.includes(searchTitle);
                }
                return null;
            };

            const displayCountryList = nextProps.countries.filter(caseInsensitiveSubmatch);

            this.setState({ displayCountryList });
        }

        const {
            countries,
            activeCountry,
            match,
            setActiveCountry,
        } = nextProps;
        const { countryId } = match.params;

        // Override activeCountry by url value
        if (countryId) {
            console.log('Id from browser found');
            setActiveCountry({ activeCountry: +countryId });
        } else if (activeCountry) {
            console.log('Redirecting to currently active country');
            browserHistory.push(`/countrypanel/${activeCountry}/`);
            // NOTE: this breaks here
        } else if (countries.length > 0) {
            console.log('Setting first country as active');
            const newActiveCountry = countries[0].id;
            setActiveCountry({ activeCountry: newActiveCountry });
            browserHistory.push(`/countrypanel/${newActiveCountry}/`);
        }
    }

    componentWillUnmount() {
        this.countriesRequest.stop();
    }

    onSelectCountry = (countryId) => {
        this.props.setActiveCountry({ activeCountry: countryId });
    }

    onAddCountry = () => {
        this.setState({
            addCountryModal: true,
        });
    };

    getStyleName = (countryId) => {
        const linkId = this.props.match.params.countryId;

        const styleNames = [];
        styleNames.push('list-item');

        if (linkId === `${countryId}`) {
            styleNames.push('active');
        }

        return styleNames.join(' ');
    }

    createRequestforCountries = () => {
        const { token } = this.props;

        const countriesRequest = new RestBuilder()
            .url(urlForRegions)
            .params(() => {
                const { access } = token;
                return createParamsForUser({ access });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'regionsGetResponse');
                    this.props.setRegions({
                        regions: response.results,
                    });
                } catch (er) {
                    console.error(er, response);
                }
            })
            .build();
        return countriesRequest;
    }

    handleSearchInputChange = (value) => {
        const caseInsensitiveSubmatch = country => (
            country.title.toLowerCase().includes(value.toLowerCase())
        );
        const displayCountryList = this.props.countries.filter(caseInsensitiveSubmatch);

        this.setState({
            displayCountryList,
            searchInputValue: value,
        });
    };

    keySelector = data => (data.countryId)

    handleModalClose = () => {
        this.setState({
            addCountryModal: false,
        });
    };

    calcCountryListItemKey = country => country.id;

    renderCountryListItem = (key, country) => {
        const { activeCountry } = this.props;
        const isActive = country.id === activeCountry;
        return (
            <ListItem
                active={isActive}
                key={key}
                scrollIntoView={isActive}
            >
                <Link
                    className="link"
                    to={`/countrypanel/${country.id}/`}
                >
                    {country.title}
                </Link>
            </ListItem>
        );
    }

    renderCountryDetail = () => {
        const {
            activeCountry,
            countries,
        } = this.props;

        if (countries.length <= 0) {
            return (
                <div styleName="country-detail-alt">
                    There are no countries.
                </div>
            );
        }

        const activeCountryIndex = countries.findIndex(
            country => country.id === activeCountry,
        );

        if (activeCountryIndex >= 0) {
            return (
                <CountryDetail
                    countryId={activeCountry}
                    key={activeCountry}
                    styleName="country-detail"
                />
            );
        }

        return (
            <div styleName="country-detail-alt">
                The country you previously selected was deleted or does not exist.
            </div>
        );
    }

    render() {
        const {
            displayCountryList,
        } = this.state;

        const sortedCountries = [...displayCountryList];
        sortedCountries.sort((a, b) => (a.title.localeCompare(b.title)));

        return (
            <div styleName="country-panel">
                <Helmet>
                    <title>
                        { pageTitles.countryPanel }
                    </title>
                </Helmet>
                <div styleName="country-list">
                    <header styleName="list-header">
                        <h2>Countries</h2>
                        <PrimaryButton
                            iconName="ion-plus"
                            onClick={this.onAddCountry}
                        >
                            Add country
                        </PrimaryButton>
                        <TextInput
                            styleName="search-input"
                            onChange={this.handleSearchInputChange}
                            placeholder="Search Country"
                            type="search"
                            value={this.state.searchInputValue}
                        />
                    </header>
                    <ListView
                        styleName="list"
                        modifier={this.renderCountryListItem}
                        data={sortedCountries}
                        keyExtractor={this.calcCountryListItemKey}
                    />
                    <Modal
                        closeOnEscape
                        onClose={this.handleModalClose}
                        show={this.state.addCountryModal}
                        closeOnBlur
                    >
                        <ModalHeader title="Add new country" />
                        <AddCountry
                            onModalClose={this.handleModalClose}
                        />
                    </Modal>
                </div>
                { this.renderCountryDetail() }
            </div>
        );
    }
}
