import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    regionDetailForRegionSelector,
    countriesStringsSelector,
} from '../../redux';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    regionDetail: PropTypes.shape({
        id: PropTypes.number,
        code: PropTypes.string,
        title: PropTypes.string,
        regionalGroups: PropTypes.shape({}),
    }).isRequired,
    countriesStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = (state, props) => ({
    regionDetail: regionDetailForRegionSelector(state, props),
    countriesStrings: countriesStringsSelector(state),
});

@connect(mapStateToProps, null)
export default class RegionDetailView extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            regionDetail,
        } = this.props;

        const regionalGroups = regionDetail.regionalGroups || '';

        const keyValues = [
            {
                key: 'Name',
                value: regionDetail.title || '',
            },
            {
                key: 'Code',
                value: regionDetail.code || '',
            },
            {
                key: 'WB Region',
                value: regionalGroups.wbRegion || '',
            },
            {
                key: 'WB Income Region',
                value: regionalGroups.wbIncomeRegion || '',
            },
            {
                key: 'OCHA Region',
                value: regionalGroups.ochaRegion || '',
            },
            {
                key: 'ECHO Region',
                value: regionalGroups.echoRegion || '',
            },
            {
                key: 'UN Geographical Region',
                value: regionalGroups.unGeoRegion || '',
            },
            {
                key: 'UN Geographical Sub Region',
                value: regionalGroups.unGeoSubRegion || '',
            },
        ];

        return (
            <div
                className={`${className} ${styles['region-detail-view']}`}
            >
                <h3
                    className={styles.heading}
                >
                    {this.props.countriesStrings('regionGeneralInfoLabel')}
                </h3>
                {
                    keyValues.map(data => (
                        data.value !== '' &&
                        <div
                            className={styles.row}
                            key={data.key}
                        >
                            <div className={styles.key}>
                                {data.key}
                            </div>
                            <div className={styles.value}>
                                {data.value}
                            </div>
                        </div>
                    ))
                }
            </div>
        );
    }
}
