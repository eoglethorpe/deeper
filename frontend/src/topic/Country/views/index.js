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
    countriesSelector,

    setNavbarStateAction,

    setActiveCountryAction,
    setCountriesAction,
} from '../../../common/redux';

import CountryDetail from '../components/CountryDetail';
import AddCountry from '../components/AddCountryForm';
import styles from './styles.scss';

const propTypes = {
    activeCountry: PropTypes.number,
    countries: PropTypes.array, // eslint-disable-line
    match: PropTypes.shape({
        params: PropTypes.shape({
            countryId: PropTypes.string,
        }),
    }),
    setCountries: PropTypes.func.isRequired,
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
    countries: countriesSelector(state),
    token: tokenSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setCountries: params => dispatch(setCountriesAction(params)),
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

            formErrors: [],
            formFieldErrors: {},
            formValues: {},
            pending: false,
            stale: false,
        };

        this.elements = [
            'name',
            'code',
        ];
        this.validations = {
            name: [requiredCondition],
            code: [requiredCondition],
        };
        const { token } = this.props;
        this.countriesRequest = new RestBuilder()
            .url(urlForRegions)
            .params(() => {
                const { access } = token;
                return createParamsForUser({ access });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'countriesGetResponse');
                    this.props.setCountries({
                        countries: response.results,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
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
                const countryTitle = country.title.toLowerCase();
                const searchTitle = searchInputValue.toLowerCase();
                return countryTitle.includes(searchTitle);
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
            formErrors: [],
            formFieldErrors: {},
            formValues: {},
            pending: false,
            stale: false,
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

    search = (value) => {
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

    renderCountryListItem = (country) => {
        const { activeCountry } = this.props;
        if (country.id !== activeCountry) {
            return (
                <ListItem
                    styleName="list-item"
                    key={country.id}
                >
                    <Link
                        styleName="link"
                        to={`/countrypanel/${country.id}/`}
                    >
                        {country.title}
                    </Link>
                </ListItem>
            );
        }
        return (
            <ListItem
                key={country.id}
                styleName="list-item active"
            >
                <Link
                    styleName="link"
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
                <div styleName="country-details-alt">
                    <h1>There are no countries.</h1>
                </div>
            );
        }

        const activeCountryIndex = countries.findIndex(
            country => country.id === activeCountry,
        );

        if (activeCountryIndex >= 0) {
            return (
                <div styleName="country-details">
                    <CountryDetail countryId={activeCountry} />
                </div>
            );
        }

        return (
            <div styleName="country-details-alt">
                <h1>The country you previously selected does not exist.</h1>
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
                    <div styleName="list-header">
                        <div styleName="header-text">
                            Countries
                        </div>
                        <PrimaryButton
                            iconName="ion-plus"
                            onClick={this.onAddCountry}
                        >
                            Add country
                        </PrimaryButton>
                        <TextInput
                            onChange={this.search}
                            placeholder="Search Country"
                            type="search"
                        />
                    </div>
                    <ListView styleName="list">
                        { sortedCountries.map(this.renderCountryListItem) }
                    </ListView>
                    <Modal
                        closeOnEscape
                        onClose={this.handleModalClose}
                        show={this.state.addCountryModal}
                        closeOnBlur
                    >
                        <ModalHeader title="Add new country" />
                        <AddCountry
                            styleName="add-country-form"
                            onModalClose={this.handleModalClose}
                        />
                    </Modal>
                </div>
                { this.renderCountryDetail() }
            </div>
        );
    }
}
