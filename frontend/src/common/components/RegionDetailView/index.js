import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    regionDetailForRegionSelector,
} from '../../../common/redux';

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
    regionDetail: regionDetailForRegionSelector(state, props),
});

@connect(mapStateToProps, null)
@CSSModules(styles, { allowMultiple: true })
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
                styleName="region-detail-view"
                className={className}
            >
                <h3
                    styleName="heading"
                >
                    Region general info
                </h3>
                {
                    keyValues.map(data => (
                        data.value !== '' &&
                        <div
                            styleName="row"
                            key={data.key}
                        >
                            <div styleName="key">
                                {data.key}
                            </div>
                            <div styleName="value">
                                {data.value}
                            </div>
                        </div>
                    ))
                }
            </div>
        );
    }
}
