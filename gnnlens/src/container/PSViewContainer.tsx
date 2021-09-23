import PSView from '../components/DataRuns/PSView'
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

//import { decrement, increment } from '../actions';
import {changePSJson, changePSSettingsModal_visible, changePSDimensions} from '../actions';
import { StoreState } from '../types';


// 将 reducer 中的状态插入到组件的 props 中
const mapStateToProps = (state: StoreState) => ({
    checkedList: state.InspectCategoryList,
    K_value:state.K_value
})

// 将 对应action 插入到组件的 props 中
const mapDispatchToProps = (dispatch: Dispatch) => ({
    changePSJson: (PSJson: any) => dispatch(changePSJson(PSJson)),
    changePSSettingsModal_visible:  (visible:boolean) => dispatch(changePSSettingsModal_visible(visible)),
    changePSDimensions: (PSDimensions:any) => dispatch(changePSDimensions(PSDimensions))
})

// 使用 connect 高阶组件对 Counter 进行包裹
export default connect(mapStateToProps, mapDispatchToProps)(PSView);



