import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    countryDetailSelector,
    setRegionDetailsAction,
} from '../../../../redux';

import RegionGetRequest from '../../requests/RegionGetRequest';

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
export default class CountryGeneral extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.state = {
            dataLoading: true,
        };
    }

    componentWillMount() {
        this.startRegionRequest(this.props.countryDetail.id);
    }

    startRegionRequest = (regionId) => {
        if (this.requestForRegion) {
            this.requestForRegion.stop();
        }
        const requestForRegion = new RegionGetRequest({
            setRegionDetails: this.props.setRegionDetails,
            setState: v => this.setState(v),
        });
        this.requestForRegion = requestForRegion.create(regionId);
        this.requestForRegion.start();
    }

    render() {
        const { countryDetail } = this.props;
        const { dataLoading } = this.state;

        return (
            <div className={styles.countryGeneral}>
                <div className={styles.detailsEdit}>
                    <div className={styles.mapContainer}>
                        <RegionMap
                            regionId={countryDetail.id}
                        />
                    </div>
                    <div className={styles.detailContainer}>
                        <RegionDetail
                            className={styles.regionDetailForm}
                            countryId={countryDetail.id}
                            dataLoading={dataLoading}
                        />
                        <RegionAdminLevel
                            className={styles.adminLevels}
                            countryId={countryDetail.id}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
