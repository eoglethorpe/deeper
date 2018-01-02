import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../public/utils/rest';
import {
    TextInput,
    requiredCondition,
} from '../../../public/components/Input';
import {
    PrimaryButton,
} from '../../../public/components/Action';
import {
    ListView,
    Modal,
    ModalHeader,
    ModalBody,
} from '../../../public/components/View';
import {
    caseInsensitiveSubmatch,
} from '../../../public/utils/common';

import {
    iconNames,
    countriesString,
} from '../../../common/constants';
import schema from '../../../common/schema';
import {
    createParamsForUser,
    urlForRegions,
} from '../../../common/rest';
import {
    countriesListSelector,

    setRegionsAction,
    activeUserSelector,
} from '../../../common/redux';

import CountryDetail from '../components/CountryDetail';
import CountryListItem from '../components/CountryListItem';
import AddRegion from '../../../common/components/AddRegion';
import styles from './styles.scss';

const propTypes = {
    countries: PropTypes.array, // eslint-disable-line
    match: PropTypes.shape({
        params: PropTypes.shape({
            countryId: PropTypes.string,
        }),
    }).isRequired,
    setRegions: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired, // eslint-disable-line
    activeUser: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    location: {},
    countries: [],
};

const mapStateToProps = state => ({
    countries: countriesListSelector(state),
    activeUser: activeUserSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setRegions: params => dispatch(setRegionsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class CountryPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const displayCountryList = [...this.props.countries];

        displayCountryList.sort((a, b) => (a.title.localeCompare(b.title)));

        this.state = {
            addCountryModal: false,
            displayCountryList,
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
        this.countriesRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { countries } = nextProps;
        const { searchInputValue } = this.state;
        if (this.props.countries !== countries) {
            const displayCountryList = countries.filter(
                country => caseInsensitiveSubmatch(country.title, searchInputValue),
            );
            displayCountryList.sort((a, b) => (a.title.localeCompare(b.title)));
            this.setState({ displayCountryList });
        }
    }

    componentWillUnmount() {
        this.countriesRequest.stop();
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
        const countriesRequest = new FgRestBuilder()
            .url(urlForRegions)
            .params(() => createParamsForUser())
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
        const { match: { params: { countryId } } } = this.props;
        const activeCountryId = +countryId;
        const isActive = country.id === activeCountryId;
        return (
            <CountryListItem
                key={key}
                countryId={country.id}
                title={country.title}
                isActive={isActive}
            />
        );
    }

    renderCountryDetail = () => {
        const {
            match,
            countries,
        } = this.props;

        const activeCountryId = +match.params.countryId;

        if (countries.length <= 0) {
            return (
                <div styleName="country-detail-alt">
                    There are no countries.
                </div>
            );
        }

        if (!activeCountryId) {
            return (
                <div styleName="country-detail-alt">
                    Select a country to view its detail.
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
                    styleName="country-detail"
                />
            );
        }

        return (
            <div styleName="country-detail-alt">
                Selected county is not found.
            </div>
        );
    }

    render() {
        const {
            displayCountryList,
        } = this.state;

        const { activeUser } = this.props;

        return (
            <div styleName="country-panel">
                <div styleName="sidebar">
                    <header styleName="header">
                        <h3 styleName="heading">
                            {countriesString.countriesLabel}
                        </h3>
                        {
                            activeUser.isSuperuser &&
                            <PrimaryButton
                                iconName={iconNames.add}
                                onClick={this.onAddCountry}
                            >
                                {countriesString.addCountryButtonLabel}
                            </PrimaryButton>
                        }
                        <TextInput
                            styleName="search-input"
                            onChange={this.handleSearchInputChange}
                            placeholder={countriesString.searchCountryPlaceholer}
                            type="search"
                            value={this.state.searchInputValue}
                            showLabel={false}
                            showHintAndError={false}
                        />
                    </header>
                    <ListView
                        styleName="country-list"
                        modifier={this.renderCountryListItem}
                        data={displayCountryList}
                        keyExtractor={this.calcCountryListItemKey}
                    />
                    <Modal
                        closeOnEscape
                        onClose={this.handleModalClose}
                        show={this.state.addCountryModal}
                        closeOnBlur
                    >
                        <ModalHeader title="Add new country" />
                        <ModalBody>
                            <AddRegion
                                onModalClose={this.handleModalClose}
                            />
                        </ModalBody>
                    </Modal>
                </div>
                { this.renderCountryDetail() }
            </div>
        );
    }
}
