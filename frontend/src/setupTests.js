import raf from './tempPolyfills'; // eslint-disable-line

// NOTE: the relative import must be before other imports in this case
import { configure } from 'enzyme'; // eslint-disable-line
import Adapter from 'enzyme-adapter-react-16'; // eslint-disable-line

configure({ adapter: new Adapter() });
