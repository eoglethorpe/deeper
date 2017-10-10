# Testing

> Author: *Bibek Dahal*

Tests are written using enzyme and jest. Tests files are stored in *\__tests__* directory which lies inside same directory as the component or logic that needs to be tested.

Following is an example for testing a component if it renders properly.

```javascript
// components/Table/__tests__/index.js

import React from 'react';
import { shallow } from 'enzyme';
import Table from '../index';

// Describe a test suite: a group of related tests
describe('<Table />', () => {
    // Initial setup (synchronous)
    const tableData = [
        { a: 'b', c: 'd' },
        { a: 'e', c: 'f' },
    ];
    const tableHeaders = [
        { a: '1', c: '2' },
    ];

    const wrapper = shallow(
        <Table
            data={tableData}
            headers={tableHeaders}
        />,
    );

    // Test if it renders
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });

    // More tests
    // ...
});
```

If the initial setup is asynchronous, one may use `beforeEach` or `beforeAll` functions, both of which can return a promise object.

To test redux-connected components, one can use the `redux-mock-store`:

```javascript
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import Table from '../index';

describe('<Table />', () => {
    const mockStore = configureStore();
    const store = mockStore(initialState);
    const wrapper = shallow(<Provider store={store}><Table /></Provider>);

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
        expect(wrapper.prop('someProp').toEqual(initialState.someProp);
    });

});
```

More examples using redux: [writing tests](https://github.com/reactjs/redux/blob/master/docs/recipes/WritingTests.md).

For event based behavioral testing, the enzyme's `simulate` method can be used as helper method.

```js
wrapper.find('button').simulate('click');
expect(wrapper.find('.no-of-clicks').text()).toBe('1');
```


