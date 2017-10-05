import CSSModules from 'react-css-modules';
import React from 'react';
import { Switch, Link, Route } from 'react-router-dom';

import browserHistory from '../../../common/browserHistory';
import CountryDetail from '../components/CountryDetail';
import { PrimaryButton } from '../../../public/components/Button';
import styles from './styles.scss';
import TextInput from '../../../public/components/TextInput';

@CSSModules(styles, { allowMultiple: true })
export default class CountryPanel extends React.PureComponent {
    constructor(props) {
        super(props);

        this.countryList = [
            {
                fullName: 'Afganistan',
                iso: 'AFG',
            },
            {
                fullName: 'Nepal',
                iso: 'NPL',
            },
            {
                fullName: 'China',
                iso: 'CHI',
            },
            {
                fullName: 'India',
                iso: 'IND',
            },
            {
                fullName: 'United States of America',
                iso: 'USA',
            },
            {
                fullName: 'Russia',
                iso: 'RUS',
            },
            {
                fullName: 'Belgium',
                iso: 'BEL',
            },
            {
                fullName: 'Argentina',
                iso: 'ARG',
            },
            {
                fullName: 'Brazil',
                iso: 'BRA',
            },
            {
                fullName: 'Columbia',
                iso: 'COL',
            },
            {
                fullName: 'Cuba',
                iso: 'CUB',
            },
            {
                fullName: 'Hiati',
                iso: 'HIA',
            },
        ];
    }

    goToAddCountry = () => {
        browserHistory.push('/countrypanel/');
    };

    dummy = (value) => {
        console.log(value);
    };

    render() {
        return (
            <div styleName="country-panel">
                <div styleName="country-list">
                    <div styleName="list-header">
                        <div styleName="header-text">
                            Countires
                        </div>
                        <PrimaryButton onClick={this.goToAddCountry}>
                            + Add country
                        </PrimaryButton>
                        <TextInput
                            type="search"
                            placeholder="Search Country"
                            onChange={this.dummy}
                        />
                    </div>
                    <div styleName="list">
                        {
                            this.countryList.map(item => (
                                <Link
                                    key={item.iso}
                                    to={`/countrypanel/${item.iso}/`}
                                    styleName="list-item"
                                >
                                    {item.fullName}
                                </Link>
                            ))
                        }
                    </div>
                </div>
                <div styleName="country-details">
                    <Switch>
                        {
                            this.countryList.map(item => (
                                <Route
                                    key={item.iso}
                                    path={`/countrypanel/${item.iso}/`}
                                    component={
                                        () => (
                                            <CountryDetail
                                                iso={item.iso}
                                                fullName={item.fullName}
                                            />
                                        )
                                    }
                                />
                            ))
                        }
                        <Route
                            path="/countrypanel/"
                            component={() => <CountryDetail fullName="Add new country" />}
                        />
                    </Switch>
                </div>
            </div>
        );
    }
}
