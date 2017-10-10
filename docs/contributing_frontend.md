# Contributing

## Project Structure

    . frontend/src
    ├── common/
    │   ├── action-creators/
    │   ├── action-types/
    │   ├── components/
    │   ├── config/
    │   ├── initial-state/
    │   ├── middlewares/
    │   ├── reducers/
    │   ├── selectors/
    │   └── utils/
    ├── public/     -> react-store[https://gitlab.com/toggle-corp/react-store/]
    ├── stylesheets/
    ├── topic/
    └── vendor/
        └── ravl/   ->  ravl[http://github.com/toggle-corp/ravl]


## React For Noobs

1. setState is an async function. If you need an action to be called after setState, it provides a second argument which accepts a callback.

2. Use immutable objects most of the time. Instead of mutating an object, use immutable-helpers.

3. If a re-render is expected after value is changed, the value should be kept in this.state. If not, don't keep it in this.state.

4. Redux store stores global states.

5. If possible, don't instantiate objects and functions in render method. Also avoid writing complex logic in render method.

6. When setting a new state to component. You can only set attributes that need to be changed.

## Internal Libraries

1. Use RestRequest for all REST api calls. Use RestBuilder to create RestRequest.

2. Use Form to validate form data.

3. Use RAVL to validate data from REST response.

## React Good Practices

1. Most likely, you will never require jquery.

2. For JSX, if there are more than one attributes, the attributes must be broken down in multiple lines. And all this attributes should be sorted in alphabetical order.

3. For imports, the absolute and relative imports must be spaced with a new line. All the default imports must be sorted alphabetically.

4. propTypes and defaultProps for React class must be written at the top of the file, only after imports. The attributes should be sorted alphabetically.

5. Prefer decorators for Higher-Order Components

6. Always use selectors to access data from redux store. Some additional calculations can be performed in selectors and the calculations are cached if selectors are used.

7. Always use action creators to dispatch action to redux store. Always use action types to define an action creator.
