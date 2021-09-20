import ParallelCoordinates from '../components/DataRuns/PSView/ParallelCoordinates';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import {changeFilters} from '../actions';
//import { decrement, increment } from '../actions';
import { StoreState } from '../types';


// 将 reducer 中的状态插入到组件的 props 中
const mapStateToProps = (state: StoreState) => ({
})

// 将 对应action 插入到组件的 props 中
const mapDispatchToProps = (dispatch: Dispatch) => ({
    changeFilters: (filters:any) => dispatch(changeFilters(filters))
})

// 使用 connect 高阶组件对 Counter 进行包裹
export default connect(mapStateToProps, mapDispatchToProps)(ParallelCoordinates);
