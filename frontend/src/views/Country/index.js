import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { caseInsensitiveSubmatch, compareString } from '../../vendor/react-store/utils/common';
import SearchInput from '../../vendor/react-store/components/Input/SearchInput';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import ListView from '../../vendor/react-store/components/View/List/ListView';
import ListItem from '../../vendor/react-store/components/View/List/ListItem';
import Modal from '../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../vendor/react-store/components/View/Modal/Body';

import {
    regionsListSelector,
    countryIdFromRouteSelector,

    setRegionsAction,
    activeUserSelector,
    countriesStringsSelector,
} from '../../redux';
import { iconNames } from '../../constants';
import AddRegion from '../../components/AddRegion';

import BoundError from '../../vendor/react-store/components/General/BoundError';
import AppError from '../../components/AppError';

import CountriesGetRequest from './requests/CountriesGetRequest';

import CountryDetail from './CountryDetail';
import CountryListItem from './CountryListItem';
import styles from './styles.scss';

const propTypes = {
    countries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    setRegions: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    countryId: PropTypes.number,
    countriesStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    countries: [],
    countryId: undefined,
};

const mapStateToProps = (state, props) => ({
    countries: regionsListSelector(state),
    activeUser: activeUserSelector(state),
    countryId: countryIdFromRouteSelector(state, props),
    countriesStrings: countriesStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setRegions: params => dispatch(setRegionsAction(params)),
});

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class CountryPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const displayCountryList = [...this.props.countries];

        displayCountryList.sort((a, b) => compareString(a.title, b.title));

        this.state = {
            addCountryModal: false,
            displayCountryList,
            searchInputValue: '',
        };
    }

    componentWillMount() {
        this.startRequestForCountries();
    }

    componentWillReceiveProps(nextProps) {
        const { countries } = nextProps;
        const { searchInputValue } = this.state;
        if (this.props.countries !== countries) {
            const displayCountryList = countries.filter(
                country => caseInsensitiveSubmatch(country.title, searchInputValue),
            );
            displayCountryList.sort((a, b) => compareString(a.title, b.title));
            this.setState({ displayCountryList });
        }
    }

    componentWillUnmount() {
        if (this.countriesRequest) {
            this.countriesRequest.stop();
        }
    }

    onAddCountry = () => {
        this.setState({
            addCountryModal: true,
        });
    };

    getStyleName = (countryId) => {
        const linkId = this.props.countryId;

        const styleNames = [];
        styleNames.push('list-item');

        if (linkId === `${countryId}`) {
            styleNames.push('active');
        }

        return styleNames.join(' ');
    }

    startRequestForCountries = () => {
        if (this.countriesRequest) {
            this.countriesRequest.stop();
        }
        const countriesRequest = new CountriesGetRequest({
            setRegions: this.props.setRegions,
        });
        this.countriesRequest = countriesRequest.create();
        this.countriesRequest.start();
    }

    handleSearchInputChange = (searchInputValue) => {
        const displayCountryList = this.props.countries.filter(
            country => caseInsensitiveSubmatch(country.title, searchInputValue),
        );

        this.setState({
            displayCountryList,
            searchInputValue,
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
        const { countryId } = this.props;
        const activeCountryId = countryId;
        const isActive = country.id === activeCountryId;
        return (
            <ListItem
                key={key}
                scrollIntoView={isActive}
                className={styles.countryListItem}
            >
                <CountryListItem
                    key={key}
                    countryId={country.id}
                    title={country.title}
                    isActive={isActive}
                />
            </ListItem>
        );
    }

    renderCountryDetail = () => {
        const {
            countryId,
            countries,
        } = this.props;

        const activeCountryId = countryId;

        if (countries.length <= 0) {
            return (
                <div className={styles.countryDetailAlt}>
                    {this.props.countriesStrings('noCountriesText')}
                </div>
            );
        }

        if (!activeCountryId) {
            return (
                <div className={styles.countryDetailAlt}>
                    {this.props.countriesStrings('selectCountryText')}
                </div>
            );
        }

        const activeCountryIndex = countries.findIndex(
            country => country.id === activeCountryId,
        );

        if (activeCountryIndex >= 0) {
            return (
                <CountryDetail
                    countryId={activeCountryId}
                    key={activeCountryId}
                    className={styles.countryDetail}
                />
            );
        }

        return (
            <div className={styles.countryDetailAlt}>
                {this.props.countriesStrings('countryNotFoundText')}
            </div>
        );
    }

    render() {
        const { displayCountryList } = this.state;
        const { activeUser } = this.props;

        return (
            <div className={styles.countryPanel}>
                <div className={styles.sidebar}>
                    <header className={styles.header}>
                        <h3 className={styles.heading}>
                            {this.props.countriesStrings('countriesLabel')}
                        </h3>
                        {
                            activeUser.isSuperuser &&
                            <PrimaryButton
                                iconName={iconNames.add}
                                onClick={this.onAddCountry}
                            >
                                {this.props.countriesStrings('addCountryButtonLabel')}
                            </PrimaryButton>
                        }
                        <SearchInput
                            className={styles.searchInput}
                            onChange={this.handleSearchInputChange}
                            placeholder={this.props.countriesStrings('searchCountryPlaceholer')}
                            value={this.state.searchInputValue}
                            showLabel={false}
                            showHintAndError={false}
                        />
                    </header>
                    { this.state.addCountryModal &&
                        <Modal
                            closeOnEscape
                            onClose={this.handleModalClose}
                            closeOnBlur
                        >
                            <ModalHeader title={this.props.countriesStrings('addCountryModalHeaderLabel')} />
                            <ModalBody>
                                <AddRegion onModalClose={this.handleModalClose} />
                            </ModalBody>
                        </Modal>
                    }
                    <ListView
                        className={styles.countryList}
                        modifier={this.renderCountryListItem}
                        data={displayCountryList}
                        keyExtractor={this.calcCountryListItemKey}
                    />
                </div>
                { this.renderCountryDetail() }
            </div>
        );
    }
}
