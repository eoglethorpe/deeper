import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import ListView from '../../vendor/react-store/components/View/List/ListView';

import { generalDetailsForRegionSelector } from '../../redux';
import _ts from '../../ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    regionDetail: PropTypes.shape({
        id: PropTypes.number,
        code: PropTypes.string,
        title: PropTypes.string,
        regionalGroups: PropTypes.shape({}),
    }).isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = (state, props) => ({
    regionDetail: generalDetailsForRegionSelector(state, props),
});

@connect(mapStateToProps)
export default class RegionDetailView extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.regionDetailMeta = {
            title: _ts('countries', 'countryNameLabel'),
            code: _ts('countries', 'countryCodeLabel'),
            wbRegion: _ts('countries', 'wbRegionLabel'),
            wbIncomeRegion: _ts('countries', 'wbIncomeRegionLabel'),
            ochaRegion: _ts('countries', 'ochaRegionLabel'),
            echoRegion: _ts('countries', 'echoRegionLabel'),
            unGeoRegion: _ts('countries', 'unGeoRegionLabel'),
            unGeoSubRegion: _ts('countries', 'unGeoSubRegion'),
        };
    }

    renderRegionDetailItem = (key) => {
        const { regionDetail = {} } = this.props;
        let { regionalGroups } = regionDetail;

        if (!regionalGroups) {
            regionalGroups = {};
        }

        const value = regionDetail[key] || regionalGroups[key];

        if (!value) {
            return null;
        }

        return (
            <div
                className={styles.row}
                key={key}
            >
                <div className={styles.title}>
                    {this.regionDetailMeta[key]}
                </div>
                <div className={styles.value}>
                    { value }
                </div>
            </div>
        );
    }

    render() {
        const { className } = this.props;

        const regionDetailsList = Object.keys(this.regionDetailMeta);

        const classNames = [
            className,
            styles.regionDetailView,
        ];

        const headingText = _ts('countries', 'regionGeneralInfoLabel');

        return (
            <div className={classNames.join(' ')}>
                <h3 className={styles.heading}>
                    { headingText }
                </h3>
                <ListView
                    className={styles.content}
                    data={regionDetailsList}
                    modifier={this.renderRegionDetailItem}
                />
            </div>
        );
    }
}
