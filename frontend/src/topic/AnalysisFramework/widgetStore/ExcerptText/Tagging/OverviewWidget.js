import React from 'react';

import {
    TextArea,
} from '../../../../../public/components/Input';


export default class ExcerptTextOverview extends React.PureComponent {
    constructor(props) {
        super(props);
        console.log(props);
    }

    render() {
        return (
            <TextArea
                disabled
                showLabel={false}
                showHintAndError={false}
            />
        );
    }
}
