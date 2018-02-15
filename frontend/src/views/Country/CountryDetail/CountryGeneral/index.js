import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../../vendor/react-store/utils/rest';

import {
    createParamsForUser,
    createUrlForRegionWithField,
} from '../../../../rest';
import {
    countryDetailSelector,
    setRegionDetailsAction,
} from '../../../../redux';
import schema from '../../../../schema';
import RegionDetail from '../../../../components/RegionDetail';
import RegionAdminLevel from '../../../../components/RegionAdminLevel';
import RegionMap from '../../../../components/RegionMap';

import styles from './styles.scss';

const propTypes = {
    countryDetail: PropTypes.shape({
        code: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
    }).isRequired,
    setRegionDetails: PropTypes.func.isRequired,
};

const mapStateToProps = (state, props) => ({
    countryDetail: countryDetailSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setRegionDetails: params => dispatch(setRegionDetailsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class CountryGeneral extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.state = {
            dataLoading: true,
        };

        this.requestForRegion = this.createRegionRequest(props.countryDetail.id);
    }

    componentWillMount() {
        this.requestForRegion.start();
    }

    createRegionRequest = (regionId) => {
        const urlForRegionForRegionalGroups = createUrlForRegionWithField(regionId, ['regional_groups']);

        const regionRequest = new FgRestBuilder()
            .url(urlForRegionForRegionalGroups)
            .params(() => createParamsForUser())
            .preLoad(() => { this.setState({ dataLoading: true }); })
            .postLoad(() => { this.setState({ dataLoading: false }); })
            .success((response) => {
                try {
                    schema.validate(response, 'region');
                    this.props.setRegionDetails({
                        regionDetails: response,
                        regionId,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return regionRequest;
    }

    render() {
        const {
            countryDetail,
        } = this.props;

        const { dataLoading } = this.state;

        return (
            <div styleName="country-general">
                <div styleName="details-edit">
                    <div styleName="detail-map-container">
                        <RegionDetail
                            styleName="region-detail-form"
                            countryId={countryDetail.id}
                            dataLoading={dataLoading}
                        />
                        <div styleName="map-container">
                            <RegionMap
                                regionId={countryDetail.id}
                            />
                        </div>
                    </div>
                    <RegionAdminLevel
                        styleName="admin-levels"
                        countryId={countryDetail.id}
                    />
                </div>
            </div>
        );
    }
}
