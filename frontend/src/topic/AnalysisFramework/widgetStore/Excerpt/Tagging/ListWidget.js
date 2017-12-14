import React from 'react';

import {
    TextArea,
} from '../../../../../public/components/Input';

// eslint-disable-next-line react/prefer-stateless-function
export default class ExcerptTextList extends React.PureComponent {
    render() {
        return (
            <TextArea
                showLabel={false}
                showHintAndError={false}
            />
        );
    }
}
