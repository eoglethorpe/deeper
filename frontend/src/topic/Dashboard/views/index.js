import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    TransparentPrimaryButton,
    TransparentDangerButton,
} from '../../../public/components/Action';
import {
    TextInput,
} from '../../../public/components/Input';
import {
    randomString,
    isFalsy,
} from '../../../public/utils/common';
import update from '../../../public/utils/immutable-update';

import {
    currentUserActiveProjectSelector,
} from '../../../common/redux';

import notify from '../../../common/notify';


import styles from './styles.scss';

const propTypes = {
    currentUserActiveProject: PropTypes.object.isRequired, // eslint-disable-line
};

const mapStateToProps = state => ({
    currentUserActiveProject: currentUserActiveProjectSelector(state),
});


const buildSettings = (indices, action, value, wrapper) => (
    // NOTE: reverse() mutates the array so making a copy
    [...indices].reverse().reduce(
        (acc, selected, index) => wrapper(
            { [selected]: acc },
            indices.length - index - 1,
        ),
        wrapper(
            { [action]: value },
            indices.length,
        ),
    )
);

@connect(mapStateToProps, undefined)
@CSSModules(styles, { allowMultiple: true })
export default class Dashboard extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.state = {
            organigram: {
                title: 'All',
                key: '1',
                organs: [
                    {
                        key: '2',
                        title: 'Head',
                        organs: [
                            {
                                key: '3',
                                title: 'Eye',
                                organs: [],
                            },
                            {
                                key: '4',
                                title: 'Nose',
                                organs: [],
                            },
                        ],
                    },
                    {
                        key: '5',
                        title: 'Body',
                        organs: [],
                    },
                ],
            },
        };
    }

    componentDidMount() {
        // setTimeout(() => {
        //     notify.send({
        //         message: 'Sending message from homescreen',
        //         duration: Infinity,
        //     });
        // }, 1000);
    }

    handleAdd = nextIndices => () => {
        const wrapper = e => ({ organs: e });
        const key = `Organ ${randomString()}`;
        const organsSetting = buildSettings(
            nextIndices,
            '$push',
            [{ key, title: '', organs: [] }],
            wrapper,
        );
        const newOrganigram = update(this.state.organigram, organsSetting);
        this.setState({ organigram: newOrganigram });
    };
    handleRemove = (indices, j) => () => {
        const wrapper = e => ({ organs: e });
        const organsSetting = buildSettings(
            indices,
            '$splice',
            [[j, 1]],
            wrapper,
        );
        console.log(organsSetting);
        const newOrganigram = update(this.state.organigram, organsSetting);
        this.setState({ organigram: newOrganigram });
    };
    handleChange = nextIndices => (value) => {
        const wrapper = (e, i) => (
            i === nextIndices.length ? { title: e } : { organs: e }
        );
        const organsSetting = buildSettings(
            nextIndices,
            '$set',
            value,
            wrapper,
        );
        const newOrganigram = update(this.state.organigram, organsSetting);
        this.setState({ organigram: newOrganigram });
    };

    renderOrgan = (organ, indices = [], j) => {
        const isFatherOrgan = isFalsy(j);
        const nextIndices = isFatherOrgan ? indices : [...indices, j];
        return (
            <div
                styleName="organ"
                key={organ.key}
            >
                <div styleName="organ-header">
                    <TextInput
                        value={organ.title}
                        styleName="title-input"
                        showHintAndError={false}
                        placeholder="Organ"
                        showLabel={false}
                        disabled={isFatherOrgan}
                        onChange={this.handleChange(nextIndices)}
                    />
                    <div styleName="action-buttons">
                        <TransparentPrimaryButton
                            styleName="action-button"
                            onClick={this.handleAdd(nextIndices)}
                            title="Add child"
                            tabIndex="-1"
                        >
                            <span className="ion-fork-repo" />
                        </TransparentPrimaryButton>
                        { !isFatherOrgan &&
                            <TransparentDangerButton
                                styleName="action-button"
                                onClick={this.handleRemove(indices, j)}
                                title="Remove"
                                tabIndex="-1"
                            >
                                <span className="ion-trash-b" />
                            </TransparentDangerButton>
                        }
                    </div>
                </div>
                <div styleName="organ-body">
                    {
                        organ.organs.map(
                            (childOrgan, i) => this.renderOrgan(childOrgan, nextIndices, i),
                        )
                    }
                </div>
            </div>
        );
    };

    render() {
        const { currentUserActiveProject } = this.props;
        return (
            <div styleName="dashboard">
                { this.renderOrgan(this.state.organigram) }
                {/*
                <p>
                    Dashboard of {currentUserActiveProject.title}
                </p>
                */}
            </div>
        );
    }
}
