import VerticalSlider from '../components/DataRuns/FeatureMatrixView/VerticalSlider';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import {changeMatrixFilters} from '../actions';
//import { decrement, increment } from '../actions';
import { StoreState } from '../types';


// 将 reducer 中的状态插入到组件的 props 中
const mapStateToProps = (state: StoreState) => ({
})

// 将 对应action 插入到组件的 props 中
const mapDispatchToProps = (dispatch: Dispatch) => ({
})

// 使用 connect 高阶组件对 Counter 进行包裹
export default connect(mapStateToProps, mapDispatchToProps)(VerticalSlider);
