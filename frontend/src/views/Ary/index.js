import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    entryStringsSelector,
    afStringsSelector,
    setAryTemplateAction,
} from '../../redux';

import ResizableH from '../../vendor/react-store/components/View/Resizable/ResizableH';

import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';

import styles from './styles.scss';

const propTypes = {
    setAryTemplate: PropTypes.func.isRequired,
};

const defaultProps = {};

const mapStateToProps = state => ({
    entryStrings: entryStringsSelector(state),
    afStrings: afStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAryTemplate: params => dispatch(setAryTemplateAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Ary extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentWillMount() {
        const template = {
            id: 1,
            createdAt: '2018-02-23T06:07:53.493270Z',
            modifiedAt: '2018-02-23T06:07:53.493351Z',
            createdBy: 82,
            modifiedBy: 82,
            createdByName: 'Bibek Dahal',
            modifiedByName: 'Bibek Dahal',
            versionId: null,
            metadataGroups: [
                {
                    fields: [
                        {
                            fieldType: 'select',
                            options: [
                                { label: 'Earthquake', key: 'earthquake' },
                                { label: 'Volcanic Activity', key: 'volcano' },
                                { label: 'Violence and Crime', key: 'violence' },
                            ],
                            id: 1,
                            title: 'Crisis type',
                        },
                        { fieldType: 'date', options: [], id: 2, title: 'Crisis start date' },
                        { fieldType: 'string', options: [], id: 3, title: 'Preparedness' },
                    ],
                    id: 1,
                    title: 'Background',
                },
                {
                    fields: [
                        { fieldType: 'string', options: [], id: 4, title: 'Lead' },
                        { fieldType: 'string', options: [], id: 5, title: 'Partners' },
                    ],
                    id: 2,
                    title: 'Stakeholders',
                },
                {
                    fields: [
                        { fieldType: 'date', options: [], id: 6, title: 'Start date' },
                        { fieldType: 'date', options: [], id: 7, title: 'End date' },
                        { fieldType: 'date', options: [], id: 8, title: 'Publication date' },
                    ],
                    id: 3,
                    title: 'Dates',
                },
                {
                    fields: [
                        {
                            fieldType: 'select',
                            options: [
                                { label: 'Pending', key: 'pending' },
                                { label: 'Processed', key: 'processed' },
                            ],
                            id: 9,
                            title: 'Status',
                        },
                        { fieldType: 'number', options: [], id: 10, title: 'Frequency' },
                    ],
                    id: 4,
                    title: 'Status',
                },
            ],
            methodologyGroups: [],
            assessmentTopics: [],
            affectedGroups: [],
            title: 'Test template',
        };

        this.props.setAryTemplate({ template });
    }

    render() {
        return (
            <ResizableH
                styleName="ary"
                leftContainerClassName={styles.left}
                rightContainerClassName={styles.right}
                leftChild={<LeftPanel />}
                rightChild={<RightPanel />}
            />
        );
    }
}
