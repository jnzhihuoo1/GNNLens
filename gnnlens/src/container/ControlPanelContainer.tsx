import ControlPanel from '../components/DataRuns/ControlPanel'
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

//import { decrement, increment } from '../actions';
import {changeInspectCategoryList, changeK_value} from '../actions';
import { StoreState } from '../types';


// 将 reducer 中的状态插入到组件的 props 中
const mapStateToProps = (state: StoreState) => ({
    InspectCategoryList: state.InspectCategoryList,
    dataset_id : state.dataset_id,
    K_value:state.K_value
})

// 将 对应action 插入到组件的 props 中
const mapDispatchToProps = (dispatch: Dispatch) => ({
    onChangeInspectCategoryList : (InspectCategoryList:any) => dispatch(changeInspectCategoryList(InspectCategoryList)),
    changeK_value: (K_value:any) => dispatch(changeK_value(K_value))
})

// 使用 connect 高阶组件对 Counter 进行包裹
export default connect(mapStateToProps, mapDispatchToProps)(ControlPanel);



