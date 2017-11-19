import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    countryDetailSelector,
} from '../../../../common/redux';

import RegionDetailForm from '../../../../common/components/RegionDetailForm';
import RegionAdminLevel from '../../../../common/components/RegionAdminLevel';

import styles from './styles.scss';

const propTypes = {
    countryDetail: PropTypes.shape({
        code: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
    }).isRequired,
};

const mapStateToProps = state => ({
    countryDetail: countryDetailSelector(state),
    state,
});

const mapDispatchToProps = dispatch => ({
    dispatch,
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class CountryGeneral extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const {
            countryDetail,
        } = this.props;

        return (
            <div styleName="country-general">
                <RegionDetailForm
                    styleName="country-general-form"
                    regionDetail={countryDetail}
                />
                <div styleName="map-details">
                    <div styleName="map-container">
                        The map
                    </div>
                    <RegionAdminLevel
                        styleName="admin-levels"
                        regionId={countryDetail.id}
                    />
                </div>
            </div>
        );
    }
}
